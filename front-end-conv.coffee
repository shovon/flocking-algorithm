fs            = require 'fs'
path          = require 'path'
CoffeeScript  = require('coffee-script')
child_process = require 'child_process'

filePath = process.argv[2]

if not filePath?
    console.log "No directory specified."
    return 1

# Convert a simple file/folder name into an absolute path, i.e. `some-file` to
# `/path/to/some-file`.
filePath = path.resolve filePath

try
    stats = fs.lstatSync filePath

    if not stats.isDirectory()
        console.log "#{filePath} is not a directory."
        return 1
catch e
    console.log "#{filePath} does not exist."
    return 1

jsEscape = (content) ->
    ###
    We want to be able to embed JavaScript code directly into a JavaScript
    string.
    ###

    return content.replace(/(['\\])/g, '\\$1')
        .replace(/[\f]/g, "\\f")
        .replace(/[\b]/g, "\\b")
        .replace(/[\n]/g, "\\n")
        .replace(/[\t]/g, "\\t")
        .replace(/[\r]/g, "\\r")

loopFiles = (arr, cb) ->
    for item, i in arr
        cb item, i, arr

fileTypes = {}
postCB = []

convertFilesOfType = (dir) ->
    # Grab the list of all files in the directory denoted by the paramter `dir`.
    fs.readdir dir, (err, files) ->
        if not err?
            loopFiles files, (file, i, files) ->
                file = path.resolve dir, file

                fs.lstat file, (err, stats) ->
                    ext = path.extname file

                    # This is the index of the file name's string that
                    # represents the index of the `.coffee` file extension. This
                    # kills two birds: it checks to determine whether the file
                    # extension is indeed the one we want, as well as used as
                    # the index of where the file extension is. Much simpler
                    # than path.extname.
                    fileExtIndex = file.indexOf(ext, file.length - ext.length)

                    if stats.isDirectory()
                        convertFilesOfType file

                    else if stats.isFile() and fileTypes[ext]?
                        fileTypes[ext] file, fileExtIndex

fileTypes['.coffee'] = (file, fileExtIndex) ->
    destFilename = "#{file.substr 0, fileExtIndex}.js"
    fs.readFile file, 'utf-8', (err, data) ->
        jsBin = CoffeeScript.compile data
        fs.writeFile destFilename, jsBin
        do (file) ->
            postCB.push ->
                fs.unlink file

convertFilesOfType filePath

process.on 'exit', ->
    for cb in postCB
        cb()