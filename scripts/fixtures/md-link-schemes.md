Allowed, and each must become an anchor:
[external](https://example.com/a) · [insecure](http://example.com/b) · [mail](mailto:hi@example.com) · [internal](/work/ofone) · [fragment](#stack)

Refused, and each must render as the literal markdown text it was:
[xss](javascript:alert(1)) · [data](data:text/html;base64,PHNjcmlwdD4=) · [vb](vbscript:msgbox) · [file](file:///etc/passwd) · [upper](JAVASCRIPT:alert(2))
