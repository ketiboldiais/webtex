main :: IO ()
main = putStrLn htmlDoc



htmlDoc :: [Char]
htmlDoc = makeHtml "Behold" "2 + 2 = " ++ show (2+2)

makeHtml :: [Char] -> [Char] -> [Char]
makeHtml title content = html_ (head_ (title_ title) <> body_ content)

html_ :: [Char] -> [Char]
html_ content = "<html>" <> content <> "</html>"

body_ :: [Char] -> [Char]
body_ content = "<body>" <> content <> "</body>"

head_ :: [Char] -> [Char]
head_ content = "<head>" <> content <> styles <> "</head>"

styles :: [Char]
styles = "<link rel=\"stylesheet\" href=\"styles.css\">"

title_ :: [Char] -> [Char]
title_ content = "<title>" <> content <> "</title>"
