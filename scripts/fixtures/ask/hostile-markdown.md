A model can write anything into a text block. This is what it must not turn into.

<script>window.alert(1)</script>

<img src="x" onerror="alert(1)">

<iframe src="https://example.com/evil"></iframe>

[click me](javascript:alert(1))

[data url](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)

[vb](vbscript:msgbox(1))

<a href="https://example.com" onclick="steal()">plain anchor</a>

An honest link stays a link: [the work index](/work) and [the site](https://www.jamesbrady.org/about).
