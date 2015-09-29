function post(datain) {

    "use strict";

    var filepath = datain.filename
        , body = nlapiDecrypt(datain.content,"base64")
        , rootFolder = datain.rootfolder;

    if (!filepath) throw nlapiCreateError('No file name specified',true);
    if (!rootFolder) throw nlapiCreateError("No destination root path specified",true);

    if (isNaN(Number(rootFolder))) {
        var pathInfo = folderId(rootFolder,null,true);
        rootFolder = pathInfo.folderid;
    }

    //include windows' case (inverted slash)
    var info = folderId(filepath,rootFolder);

    nlapiLogExecution("DEBUG","folder",info.folderid);

    if (info.filename) {
        var file = nlapiCreateFile(info.filename,info.nsfileext,body);
        file.setFolder(info.folderid);
        var r = JSON.stringify(nlapiSubmitFile(file));
        nlapiLogExecution("ERROR","up!",r);
        return { message : "Uploaded to file id " + r , fileid : r };
    }

}

var EXT_TYPES = {
    dwg :	'AUTOCAD',
    bmp :	'BMPIMAGE',
    csv :	'CSV',
    xls :	'EXCEL',
    swf :	'FLASH',
    gif :	'GIFIMAGE',
    gz :	'GZIP',
    htm :	'HTMLDOC',
    ico :	'ICON',
    js :	'JAVASCRIPT',
    jpg :	'JPGIMAGE',
    eml :	'MESSAGERFC',
    mp3 :	'MP3',
    mpg :	'MPEGMOVIE',
    mpp :	'MSPROJECT',
    pdf :	'PDF',
    pjpeg :	'PJPGIMAGE',
    txt :	'PLAINTEXT',
    png :	'PNGIMAGE',
    ps :	'POSTSCRIPT',
    ppt :	'POWERPOINT',
    mov :	'QUICKTIME',
    rtf :	'RTF',
    sms :	'SMS',
    css :	'STYLESHEET',
    tiff :	'TIFFIMAGE',
    vsd :	'VISIO',
    doc :	'WORD',
    xml :	'XMLDOC',
    zip :	'ZIP'
}


function folderId(path,root,isFolder) {

    "use strict"

    //windows fix
    var fname = path.replace(/[\\]/g,"/");
    //pass folder instead of file as arg
    if (isFolder && fname.charAt(fname.length-1) != "/") {
        fname += "/";
    }
    var fname_split = fname.split("/");
    var folderId = root;

    var len = fname_split.length - 1;
    for ( var it = 0 ; it < len ; it++ ) {
        var item = fname_split[it];
        if (!item.length) continue;
        var res_folder = nlapiSearchRecord( "folder", null ,
            [ [ "name" , "is" , item ] , "and" , [ "parent" , "anyof" , folderId || '@NONE@' ] ]
        );
        if (!res_folder) throw nlapiCreateError("Folder " + item + " not found!",true);
        folderId = res_folder[0].getId();
    }

    var out = {};
    out.folderid = folderId;
    out.filename = fname_split[fname_split.length-1];
    out.fileext = out.filename.substr(out.filename.lastIndexOf(".")+1);
    out.nsfileext = EXT_TYPES[out.fileext] || "PLAINTEXT";

    return out;

}