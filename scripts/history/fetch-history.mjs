#!/usr/bin/env node
// Fetch James's PUBLIC GitHub record and write content/history/history.snapshot.json.
//
// Privacy by construction: only repositories named in content/history/allowlist.json are written by
// name. Every other merged PR is counted into an anonymous bucket (its repo name never leaves this
// process), so client- or person-named repositories cannot reach the public site through this file.
//
// Token: GITHUB_TOKEN, else `gh auth token`. Public data only (is:public in every search).
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ALLOW = JSON.parse(readFileSync(join(ROOT, "content/history/allowlist.json"), "utf8"));
const allowed = new Set(ALLOW.repos.map((r) => r.name.toLowerCase()));
const TOKEN = process.env.GITHUB_TOKEN || execFileSync("gh", ["auth", "token"], { encoding: "utf8" }).trim();
const OWNERS = ["CryptoJym", "h3ro-dev"];

async function gql(query, variables = {}) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${TOKEN}`, "Content-Type": "application/json", "User-Agent": "jamesbrady-org-history" },
    body: JSON.stringify({ query, variables }),
  });
  const j = await res.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors).slice(0, 400));
  return j.data;
}

async function mergedPRs() {
  const out = [];
  let after = null;
  for (;;) {
    const d = await gql(
      `query($q:String!,$after:String){search(query:$q,type:ISSUE,first:100,after:$after){issueCount pageInfo{hasNextPage endCursor}
        nodes{... on PullRequest{mergedAt repository{nameWithOwner isPrivate owner{login}}}}}}`,
      { q: "author:CryptoJym is:pr is:merged is:public", after },
    );
    for (const n of d.search.nodes) if (n?.mergedAt && !n.repository.isPrivate) out.push(n);
    if (!d.search.pageInfo.hasNextPage) return { total: d.search.issueCount, prs: out };
    after = d.search.pageInfo.endCursor;
  }
}

async function repos() {
  const out = [];
  for (const login of OWNERS) {
    let after = null;
    for (;;) {
      const d = await gql(
        `query($login:String!,$after:String){repositoryOwner(login:$login){repositories(first:100,after:$after,privacy:PUBLIC,ownerAffiliations:OWNER){
          pageInfo{hasNextPage endCursor} nodes{nameWithOwner createdAt pushedAt stargazerCount isFork isArchived}}}}`,
        { login, after },
      );
      const page = d.repositoryOwner.repositories;
      out.push(...page.nodes);
      if (!page.pageInfo.hasNextPage) break;
      after = page.pageInfo.endCursor;
    }
  }
  return out;
}

async function releases(nameWithOwner) {
  const [owner, name] = nameWithOwner.split("/");
  const d = await gql(
    `query($o:String!,$n:String!){repository(owner:$o,name:$n){releases(first:100,orderBy:{field:CREATED_AT,direction:DESC}){nodes{tagName publishedAt}}}}`,
    { o: owner, n: name },
  );
  return d.repository.releases.nodes.filter((r) => r.publishedAt).map((r) => ({ tag: r.tagName, date: r.publishedAt.slice(0, 10) }));
}

const day = (iso) => iso.slice(0, 10);
const [{ total, prs }, allRepos] = await Promise.all([mergedPRs(), repos()]);

const repoOut = [];
for (const r of allRepos) {
  if (!allowed.has(r.nameWithOwner.toLowerCase())) continue;
  repoOut.push({ name: r.nameWithOwner, created: day(r.createdAt), pushed: day(r.pushedAt), stars: r.stargazerCount, fork: r.isFork, merges: [] });
}
const byName = new Map(repoOut.map((r) => [r.name.toLowerCase(), r]));
const anonymous = { ownRepos: [], otherPeoplesRepos: [] };
const upstream = [];
for (const pr of prs) {
  const key = pr.repository.nameWithOwner.toLowerCase();
  const d = day(pr.mergedAt);
  if (byName.has(key)) byName.get(key).merges.push(d);
  else if (ALLOW.upstream.some((u) => u.name.toLowerCase() === key)) upstream.push({ name: ALLOW.upstream.find((u) => u.name.toLowerCase() === key).name, date: d });
  else if (OWNERS.some((o) => o.toLowerCase() === pr.repository.owner.login.toLowerCase())) anonymous.ownRepos.push(d);
  else anonymous.otherPeoplesRepos.push(d); // client sites and other people's projects, never named here
}
for (const r of repoOut) r.merges.sort();
for (const k of Object.keys(anonymous)) anonymous[k].sort();

const rel = {};
for (const name of ALLOW.releasesFor) rel[name] = await releases(name);

const now = new Date();
const since30 = new Date(now.getTime() - 30 * 864e5).toISOString().slice(0, 10);
const allDates = prs.map((p) => day(p.mergedAt));
const snapshot = {
  generatedAt: now.toISOString(),
  method: "GitHub GraphQL API, public data only: search `author:CryptoJym is:pr is:merged is:public`; public repositories owned by CryptoJym and h3ro-dev; releases of the listed repositories.",
  totals: {
    mergedPublicAll: total,
    mergedPublic30d: allDates.filter((d) => d >= since30).length,
    publicRepos: allRepos.length,
    publicStars: allRepos.reduce((s, r) => s + r.stargazerCount, 0),
  },
  // Counts only, so repositories that may not be named still count.
  createdPerMonth: allRepos.reduce((m, r) => ((m[r.createdAt.slice(0, 7)] = (m[r.createdAt.slice(0, 7)] ?? 0) + 1), m), {}),
  repos: repoOut.sort((a, b) => a.created.localeCompare(b.created)),
  upstream,
  anonymous,
  releases: rel,
};
writeFileSync(join(ROOT, "content/history/history.snapshot.json"), JSON.stringify(snapshot, null, 1) + "\n");
console.log(`wrote history.snapshot.json: ${total} merged public PRs (${snapshot.totals.mergedPublic30d} in 30 days), ${repoOut.length} named repos of ${allRepos.length} public, anonymous own=${anonymous.ownRepos.length} other-owners=${anonymous.otherPeoplesRepos.length}, upstream=${upstream.length}`);
