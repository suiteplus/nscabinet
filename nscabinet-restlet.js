function post(datain) {

    "use strict";

    var filepath = datain.filename
        , body = nlapiDecrypt(datain.content,"base64")
        , rootFolder = datain.rootfolder;

    if (!filepath) throw nlapiCreateError('No file name specified',true);
    if (!rootFolder) throw nlapiCreateError("No destination root path specified",true);

    var fileFolder = rootFolder;

    //include windows' case (inverted slash)
    var fname_split = filepath.replace(/[\\]/g,"/").split("/");

    var len = fname_split.length -1;
    for ( var it = 0 ; it < len ; it++ ) {
        var item = fname_split[it];
        if (!item.length) continue;
        var res_folder = nlapiSearchRecord( "folder", null ,
            [ [ "name" , "is" , item ] , "and" , [ "parent" , "is" , fileFolder ] ]
        );
        if (!res_folder) throw nlapiCreateError("Folder " + item + " not found!",true);
        fileFolder = res_folder[0].getId();
    }

    var filename = fname_split[fname_split.length-1];
    var fileext = filename.substr(filename.lastIndexOf(".")+1);
    var nsfileext = "JAVASCRIPT";
    if ( fileext == "html" ) nsfileext = "HTMLDOC";

    nlapiLogExecution("DEBUG","folder",fileFolder);

    if (filename) {
        var file = nlapiCreateFile(filename,nsfileext,body);
        file.setFolder(fileFolder);
        var r = JSON.stringify(nlapiSubmitFile(file));
        nlapiLogExecution("ERROR","up!",r);
        return r;
    }

}