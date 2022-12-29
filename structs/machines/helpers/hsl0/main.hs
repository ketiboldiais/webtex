tagHtml content = "<html><body>" <> content <> "</body></html>"
page = tagHtml "I've been wrapped!"

main = putStrLn page
