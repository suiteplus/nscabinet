/* eslint-env browser */
/* exported post */

function log() {
    var txt = [];
    for (var it in arguments) {
        txt.push(arguments[it]);
    }
    nlapiLogExecution('DEBUG', 'log', JSON.stringify(txt));
}

var post = function (datain) {
    'use strict';

    //ROUTER

    switch (datain.action) {
    case 'download':
        return download(datain);
    case 'upload':
        return upload(datain);
    case 'url':
        return url(datain);
    default:
        return {message: 'invalid action'};
    }
};

var upload = function (datain) {

    if (!datain.filepath) throw nlapiCreateError('PARAM_ERR', 'No file path specified', true);
    if (!datain.rootpath) throw nlapiCreateError('PARAM_ERR', 'No destination root path specified', true);

    var info = pathInfo(datain.filepath, datain.rootpath, true);
    var body = datain.content;
    if (~NON_BINARY_FILETYPES.indexOf(info.nsfileext))
        body = nlapiDecrypt(datain.content, 'base64');

    if (info.filename) {
        var file = nlapiCreateFile(info.filename, info.nsfileext, body);
        file.setFolder(info.folderid);
        if (datain.isonline){
            file.setIsOnline(true);
        }
        var r = JSON.stringify(nlapiSubmitFile(file));
        nlapiLogExecution('DEBUG', 'up!', r);
        return {message: 'Uploaded ' + info.filename + ' to file id ' + r, fileid: Number(r)};
    }
};

var download = function (datain) {
    if (!(datain.files instanceof Array)) {
        datain.files = [datain.files];
    }

    var errors = [];
    function getFileData(file, info, folder) {
        var contents = file.getValue();

        if (~NON_BINARY_FILETYPES.indexOf(file.getType()))
            contents = nlapiEncrypt(contents, 'base64');

        var base;
        if (info.tails) {
            var curr = info.tails.filter(function(t){
                return t.folderid == folder;
            })[0];
            if (!curr) throw nlapiCreateError('RECURSIVE_SEARCH', 'Unexpected execution.', true);
            base = curr.baserelative;
        } else {
            base = info.baserelative;
        }

        return {
            path: base + '/' + file.getName(),
            contents: contents
        };
    }

    var outfiles = [];

    datain.files.forEach(function (glob) {
        var info = pathInfo(glob, datain.rootpath);

        //found out nlapiSearchRecord('file') filtered by folder returns a recursive search,
        //which turns out to be nasty for performance.
        //so, split in 2 cases. If the path seems to be absolute, load directly. If not, execute the search.
        if ( /\*|\%/g.test(glob) ) {

            var folders_in = ( info.tails ) ?
                info.tails.map( function(t) { return t.folderid; } ) :
                [info.folderid];

            var filter = ['folder', 'anyof', folders_in];

            if ( info.filename == '*' || info.filename == '*.*' || info.filename == '**' ) { /* -- */}
            else if( /\*/g.test(info.filename) ) {
                filter.push('and');
                filter.push(['name', 'contains', info.filename.replace(/\*/g, '%')]);
            } else {
                filter.push('and');
                filter.push(['name', 'is', info.filename]);
            }

            var columns = ['name', 'filetype', 'folder'].map(function (i) {
                return new nlobjSearchColumn(i);
            });

            var files = nlapiSearchRecord('file', null, filter, columns) || [];
            var addFiles = files.filter(function (resFile) {
                return folders_in.filter(function(f){
                    return f == resFile.getValue('folder');
                }).length > 0;
            }).map(function (resFile) {
                var file = nlapiLoadFile(resFile.getId());
                return getFileData(file, info, resFile.getValue('folder') );
            });

            outfiles = outfiles.concat(addFiles);
            //case 2: direct load
        } else {
            try {
                var file = nlapiLoadFile(info.pathabsolute.substr(1));
                outfiles = outfiles.concat([getFileData(file, info)]);
            } catch (e) {
                errors.push(e);
            }
        }
    });

    var out = {files: outfiles};
    if (errors.length) out.error = errors;
    log(out);
    return out;

};


function url(inp) {
    var file = nlapiLoadFile(inp.path);
    return {
        url : file.getURL()
    };
}


var NON_BINARY_FILETYPES = [
    'CSV',
    'HTMLDOC',
    'JAVASCRIPT',
    'MESSAGERFC',
    'PLAINTEXT',
    'POSTSCRIPT',
    'RTF',
    'SMS',
    'STYLESHEET',
    'XMLDOC'
];

var EXT_TYPES = {
    dwg: 'AUTOCAD',
    bmp: 'BMPIMAGE',
    csv: 'CSV',
    xls: 'EXCEL',
    swf: 'FLASH',
    gif: 'GIFIMAGE',
    gz: 'GZIP',
    htm: 'HTMLDOC',
    html: 'HTMLDOC',
    ico: 'ICON',
    js: 'JAVASCRIPT',
    jpg: 'JPGIMAGE',
    eml: 'MESSAGERFC',
    mp3: 'MP3',
    mpg: 'MPEGMOVIE',
    mpp: 'MSPROJECT',
    pdf: 'PDF',
    pjpeg: 'PJPGIMAGE',
    txt: 'PLAINTEXT',
    png: 'PNGIMAGE',
    ps: 'POSTSCRIPT',
    ppt: 'POWERPOINT',
    mov: 'QUICKTIME',
    rtf: 'RTF',
    sms: 'SMS',
    css: 'STYLESHEET',
    tiff: 'TIFFIMAGE',
    vsd: 'VISIO',
    doc: 'WORD',
    xml: 'XMLDOC',
    zip: 'ZIP'
};


function pathInfo(pathIn, baseIn, createFolders) {
    if (baseIn === void 0) { baseIn = '/'; }
    if (createFolders === void 0) { createFolders = false; }
    if (pathIn.charAt(0) == '/') {
        pathIn = pathIn.substr(1);
        baseIn = '/';
    }
    if (baseIn.substr(-1) != '/')
        baseIn += '/';
    var absPath = (baseIn + pathIn)
        .replace(/[\\]/g, '/');
    var _split = absPath.split('/');
    var filename = _split[_split.length - 1];
    _split.length = _split.length - 1;
    var absBase = _split.join('/');
    var absBaseSplit = _split.slice(1);
    var hasWildcard = absBaseSplit.some(function (i) { return i == '**'; });
    var _ext = filename && (filename.indexOf('.') > 0) ? filename.split('.').pop() : null;
    var prevFolder = null;
    if (!hasWildcard) {
        absBaseSplit.forEach(function (folderName) {
            var filters = [
                ['name', 'is', folderName],
                'and',
                ['parent', 'anyof', (prevFolder || '@NONE@')]
            ];
            var res_folder = nlapiSearchRecord('folder', null, filters);
            if (!res_folder && !createFolders) {
                throw nlapiCreateError('FOLDER_NOT_FOUND', 'Folder ' + folderName + ' not found!', true);
            }
            else if (!res_folder && createFolders) {
                var newFolderRec = nlapiCreateRecord('folder');
                newFolderRec.setFieldValue('name', folderName);
                newFolderRec.setFieldValue('parent', prevFolder);
                prevFolder = nlapiSubmitRecord(newFolderRec);
            }
            else {
                prevFolder = res_folder[0].getId();
            }
        });
        return {
            folderid: prevFolder,
            filename: filename ? filename : null,
            fileext: _ext,
            nsfileext: _ext ? EXT_TYPES[_ext] : null,
            pathabsolute: filename ? absPath : null,
            pathrelative: filename ? _relativePath(absPath, baseIn) : null,
            baseabsolute: absBase,
            baserelative: _relativePath(absBase, baseIn)
        };
    }
    else {
        var preWildcard_1 = '', postWildcard_1 = '', isAfter_1 = false;
        absBaseSplit.forEach(function (item) {
            if (item == '**')
                isAfter_1 = true;
            else if (isAfter_1)
                postWildcard_1 += '/' + item;
            else {
                preWildcard_1 += '/' + item;
            }
        });
        var found = allFolders().filter(function (folder) {
            var pre = !preWildcard_1.length || (folder.abspath.substr(0, preWildcard_1.length) == preWildcard_1);
            var post = !postWildcard_1.length || (folder.abspath.substr(-postWildcard_1.length) == postWildcard_1);
            return pre && post;
        }).map(function (folder) {
            var pabs = filename ? folder.abspath + '/' + filename : null;
            return {
                folderid: folder.id,
                pathabsolute: pabs,
                pathrelative: filename ? _relativePath(pabs, baseIn) : null,
                baseabsolute: folder.abspath,
                baserelative: _relativePath(folder.abspath, baseIn)
            };
        });
        return {
            filename: filename ? filename : null,
            fileext: _ext,
            nsfileext: _ext ? EXT_TYPES[_ext] : null,
            baseabsolute: preWildcard_1,
            baserelative: _relativePath(preWildcard_1, baseIn),
            tails: found
        };
    }
}


var __allFoldersMemo;
function allFolders() {
    if (__allFoldersMemo) return __allFoldersMemo;
    var _allFolders = Search.big('folder', null, Search.cols(['name', 'parent']));
    var allFolders = _allFolders.map(Search.collection);
    var foldersIdxParent = allFolders.reduce(function (bef, curr) {
        curr.parent = curr.parent || '_ROOT';
        bef[curr.parent] = bef[curr.parent] || [];
        bef[curr.parent].push(curr);
        return bef;
    }, {});
    foldersIdxParent['_ROOT'].forEach(function (item) {
        function swipe(f) {
            if (foldersIdxParent[f.id]) {
                foldersIdxParent[f.id].forEach(function (inner) {
                    inner.abspath = f.abspath + '/' + inner.name;
                    swipe(inner);
                });
            }
        }
        item.abspath = '/' + item.name;
        swipe(item);
    });
    __allFoldersMemo = allFolders;
    return allFolders;
}


function _relativePath(src, relativeTo) {
    var o;
    if (src.substr(0, relativeTo.length) == relativeTo) {
        o = src.substr(relativeTo.length);
    }
    else {
        var s_src = src.split('/').filter(function (i) { return i == true; });
        var s_rel = relativeTo.split('/').filter(function (i) { return i == true; });
        var count = 0, walk = '';
        for (var x = 0; x < s_src.length; x++) {
            if (s_rel[x] == s_src[x])
                count++;
            else {
                walk += '/' + s_src[x];
            }
        }
        for (x = 0; x < count; x++) {
            walk = '../' + walk;
        }
        o = walk;
    }
    return o || '.';
}

// ----

var Search = {};


Search.big = function (recordtype, filters, columns) {
    var res = nlapiCreateSearch(recordtype, filters, columns).runSearch();
    var res_chunk, start_idx = 0, res_final = [];
    do {
        res_chunk = res.getResults(start_idx, start_idx + 1000) || [];
        res_final = res_final.concat(res_chunk);
        start_idx += 1000;
    } while (res_chunk.length);
    return res_final;
};


Search.cols = function (cols) {
    return cols.map(function (coluna) {
        if (typeof coluna == 'string') {
            var split = coluna.split('.');
            if (split[1])
                return new nlobjSearchColumn(split[1], split[0]);
            return new nlobjSearchColumn(split[0]);
        }
        else if (coluna instanceof nlobjSearchColumn) {
            return coluna;
        }
        else
            throw nlapiCreateError('mapSearchCol', 'Entrada inválida');
    });
};


Search.collection = function (result) {
    var columns = result.getAllColumns() || [];
    var ret = columns.reduce(function (prev, curr) {
        var name, join = curr.getJoin();
        if (join) {
            name = join + '.' + curr.getName();
        }
        else {
            name = curr.getName();
        }
        prev[name] = result.getValue(curr);
        if (result.getText(curr))
            prev.textref[name] = result.getText(curr);
        return prev;
    }, { textref: {} });
    ret['id'] = result.getId();
    return ret;
};