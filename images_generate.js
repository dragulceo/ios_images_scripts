var exports_dimensions, command_patterns,
    sys = require('sys'),
    exec = require('child_process').exec,
    fs = require('fs'),
    path = require('path');

exports_dimensions = require('./dimensions.json');
command_patterns = [
    {
        'match': new RegExp('\.(jpg|png)$', 'i'),
        //'command': commandFunctionFactory('convert ${source} -resize ${width}x${height} ${output}')
        'command': commandFunctionFactory('convert ${source} -resize "${width}x${height}^" -gravity center -crop ${width}x${height}^+0+0 +repage  ${output}')
    },
    {
        'match': new RegExp('\.svg$', 'i'),
        //'command': commandFunctionFactory('/Applications/Inkscape.app/Contents/Resources/bin/inkscape-bin -z ${source} -w${width} -h${height} --export-png=${output}')
        'command': commandFunctionFactory('inkscape -z ${source} -w${width} -h${height} --export-png=${output}')
    }
];

function commandFunctionFactory(str) {
    var reg = /\${([^}]+)}/g,
        tokens = [], match;

    while (match = reg.exec(str)) {
        tokens[match[1]] = new RegExp(escapeRegExp(match[0]), 'g');
    }
    return function (replacements) {
        return replaceTokens(str, tokens, replacements);
    }
}

function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceTokens(input, tokens, replacements) {
    var key;
    for (key in tokens) {
        if (tokens.hasOwnProperty(key)) {
            input = input.replace(tokens[key], replacements[key]);
        }
    }
    return input;
}


function getInt(number, defaultValue) {
    var ret = parseInt(number, 10);
    if (isNaN(ret)) {
        return defaultValue || 0;
    }
    return ret;
}

function getCommandForSource(source, width, height, output) {
    var n = command_patterns.length, i, command, replacements = {
        'source': source,
        'width': getInt(width),
        'height': getInt(height),
        'output': output
    };
    for (i = 0; i < n; i++) {
        if (source.match(command_patterns[i].match)) {
            command = command_patterns[i].command(replacements);
            console.log(command);
            return command;
        }
    }
    return '';
}

function puts(error, stdout, stderr) {
    if (stderr) {
        sys.puts(stderr);
    }
    if (stdout) {
        sys.puts(stdout);
    }
}

function resize(source, width, height, filename) {
    //command = 'convert ' + source + ' -resize ' + width + 'x' + height + ' ' + filename;
    //command = 'inkscape -z -e ' + source + ' -w ' + width + ' -h ' + height + ' ' + filename;
    exec(getCommandForSource(source, width, height, filename), puts);
}

function exportItem(source, item, width, height, extension) {
    var namePrefix, filename;
    extension = extension || '.png';
    namePrefix = "./out/" + path.basename(source).replace(/\.[a-z]+$/, '') + '_' + (item.orientation || 'landscape');
    filename = namePrefix + '_' + (width) + '_' + (height) + extension;
    if (item.retina) {
        //the original image with half the widht and height
        resize(source, width / 2, height / 2, filename);
        //the @2x version with full width and height
        filename = namePrefix + '_' + width + '_' + height + '@2x' + extension;
    }
    resize(source, width, height, filename);
}


function exportResizeItems(exports, source) {
    var width, height, items, exportDetails, additionalItem, item, n, key;
    for (key in exports) {
        if (exports.hasOwnProperty(key)) {
            item = exports[key];
            item.orientation = 'landscape';
            items = [item];
            if (item.all_orientations) {
                additionalItem = {
                    size: [item.size[1], item.size[0]],
                    orientation: 'portrait'
                };
                if (item.retina) {
                    additionalItem.retina = item.retina;
                }
                items.push(additionalItem);
            }

            n = items.length;
            while (n--) {
                exportDetails = items[n];
                width = exportDetails.size[0];
                height = exportDetails.size[1];
                exportItem(source, exportDetails, width, height);
            }
        }
    }
}

function usage() {
    sys.puts('Example usage: node images_generate.js file [dimension_key]');
}

function checkPath(path) {
    if (!fs.existsSync(path)) {
        throw new Error('Invalid input file: ' + path);
    }
    return path;
}

function checkDimension(dim) {
    if (dim in exports_dimensions) {
        return dim;
    }
    return 'launch';
}

process.on('uncaughtException', function (err) {
    usage();
    console.log('Caught exception: ' + err);
});

exportResizeItems(exports_dimensions[checkDimension(process.argv[3])], checkPath(process.argv[2]));