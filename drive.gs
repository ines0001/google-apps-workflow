/**********************************
// Fonction permettant de convertir un .xls
// en Google Spreadsheet depuis le Drive
// [in] : ID fichier .xls
// [in]
// [out] : ID fichier converti.
// A noter que le fichier généré est stocké
// sous le Drive user
/***********************************/
function convert_XLSfile_to_Gdrive(xlsxFileId){
  if(_isMSType(xlsxFileId)){
      var sheetfile = convert_MSfile_to_Gdrive(xlsxFileId);
      DriveApp.removeFile(DriveApp.getFileById(xlsxFileId));
      return sheetfile;
  }
  else{
    DriveApp.removeFile(DriveApp.getFileById(xlsxFileId));
    throw 'not .xls file';
  }
}


/**********************************
// Fonction permettant de convertir un .xls
// en Google Spreadsheet depuis le Drive
// [in] : ID fichier .xls
// [in]
// [out] : ID fichier converti.
// A noter que le fichier généré est stocké
// sous le Drive user
/***********************************/
function convert_MSfile_to_Gdrive(FileId) { 
  try{
  var fileSrc = DriveApp.getFileById(FileId);
  var xlsxBlob = fileSrc.getBlob();
  var file = {
    title: Utilities.formatDate(new Date(), "GMT+02:00", "yyyy-MM-dd HH:mm:ss")+'_'+getFilename(FileId)
  };
  
  
  file = Drive.Files.insert(file, xlsxBlob, {
    convert: true
  });
  }catch(e){Logger.log(e);throw(e)}
  
  return (file.id);
  
}

/*************************************************
// Fonction qui détermine si le fichier est un au format .xls
// [in] : ID fichier .xls
// [in]
// [out] : booleen exception si n'existe pas
/*************************************************/
function _isMSType(id){

     return(DriveApp.getFileById(id).getMimeType()==MIMETYPE_MS)
}


// BEGIN DRIVE INTERFACE
/* fonction permettant de déplacer les fichiers(files) vers
   le dossier drive (destination). La fonction permet de créer
   le folder destination si celui-ci n'existe pas. Tous les fichiers
   sources (IDs) seront ensuite effacés de la source DRIVE du user
   files : Array ID drive file
   destination: string define the name folder destination
   // [in] : (Array) array contenant une liste de ID de fichier à déplacer
   // [in] : (ID) ID Folder destination
   // [in] : (String) Name SubFolder destination
   // [out] : (string) url fichier déplacé
/***********************************/
function saveFiles(files,destination,subdestination){
try{
    var file, folder = DriveApp.getFolderById(ID_FOLDER_FILES);
    
    
    var folder_dest = folder.getFoldersByName(destination);
    if(__DEBUG__) {Logger.finest(JSON.stringify(files));}
    /* verification de l'existence du dossier destination */
    if(!folder_dest.hasNext()){
        folder_dest = folder.createFolder(destination);
    }else folder_dest = folder_dest.next();
    
    /* Existance d'un sous dossier */
    var sub_folder;
    
  if(subdestination===undefined){
    sub_folder = '';
  }else{
    sub_folder= folder_dest.getFoldersByName(subdestination);
    if(!sub_folder.hasNext()){
        sub_folder = folder_dest.createFolder(subdestination);
    }else sub_folder = sub_folder.next();
    folder_dest = sub_folder;
  }
    
  
  
    /* recopie de l'ensemble des fichiers dans le folder destination*/
    
    for(var index=0; index< files.length;index++){
      if(files[index]===undefined || typeof files[index]!='string' || files[index]=='' ) continue;
      
      file = DriveApp.getFileById(files[index]);
      file.makeCopy(folder_dest);
      
      DriveApp.removeFile(file);
    }
 
    
    return folder_dest.getUrl();
}catch(e){treatmentException_(e)}   
}

 //\/\/\/\/\/\/BEGIN MANTIS 084
/* fonction permettant de déplacer un fichiers(files) vers
   le dossier drive (destination). La fonction permet de créer
   le folder destination si celui-ci n'existe pas. Tous les fichiers
   sources (IDs) seront ensuite effacés de la source DRIVE du user
   files : Array ID drive file
   destination: string define the name folder destination
   // [in] : ID de fichier à déplacer
   // [in] : (ID Folder destination
   // [in] : (String) Name SubFolder destination
   // [out] : ID fichier déplacé
/***********************************/
function saveFile(id,destination,subdestination){
try{
    var file, out, folder = DriveApp.getFolderById(destination);
    

    
    /* Existance d'un sous dossier */
    var sub_folder;
    
  if(subdestination===undefined){
    sub_folder = '';
  }else{
    sub_folder= folder.getFoldersByName(subdestination);
    if(!sub_folder.hasNext()){
        sub_folder = folder.createFolder(subdestination);
    }else sub_folder = sub_folder.next();
    folder = sub_folder;
  }
  
  
  file = DriveApp.getFileById(id);
  out = file.makeCopy(folder).getId();
  
  DriveApp.removeFile(file);
  
  Logger.log('saveFile( source:%s , drive destination:%s , subfolder:%s )= id out: %s ',id,destination,(subdestination==undefined || subdestination ),out);  
  return out;
}catch(e){treatmentException_(e)}   
}
 //\/\/\/\/\/\/END MANTIS 084

/* fonction permettant de récupérer l'ID Google d'un folder
   depuis la réference dossier AO
   // [in] : référence du l'AO
  
   // [out] : ID du folder trouvé or null
/***********************************/
function getID_reference(reference,create){
try{
    var out,folder = DriveApp.getFolderById(ID_FOLDER_FILES);
    
    
    var folder_dest = folder.getFoldersByName(reference);
    
    /* verification de l'existence du dossier destination */
    if(!folder_dest.hasNext() ){
       
        out = (create!==undefined && create )?folder.createFolder(reference).getId():null;
        
       }else out = folder_dest.next().getId();
    
    Logger.log('getID_reference( id source: %s , boolean force create: %s )= id out: %s ',reference,(create!==undefined && create ),out);
   
    return out;
}catch(e){treatmentException_(e)}   
}


function getFilename(Id){
  var fileList;
  try{
    fileList = DriveApp.getFileById(Id).getName();
  
  }catch(e){fileList="";}
  
  return fileList;

}

function getUrl(Id){
  var fileList;
  try{
    fileList = DriveApp.getFileById(Id).getUrl();
  
  }catch(e){fileList="";}
  
  return fileList;

}

function Copy_DriveAPI(source, destination){
  
  // Recopie de l'ensemble des fichiers du répertoire courant
  var tick=0,fileList = source.getFiles();
  while (fileList.hasNext())
  {
    tick++;
    fileList.next().makeCopy(destination);
  }
  
  // Recopie de l'ensemble des folders puis récursivité de la fonction
  var folders = source.getFolders();
  while (folders.hasNext())
  {
    var folder = folders.next();
    
    tick+=Copy_DriveAPI(folder,destination.createFolder(folder.getName()));
  }
  return tick;
}

function Logg(format)
{

  var time=new Date();
  Logger.log('[%s]-%s',time.toTimeString(),format);
  
}

function drive_testing(){
  
  try{
    //https://drive.google.com/open?id=0BxTfS7jXR_FYTjRyRFBEc3pwOEU
    Logger.log(convert_XLSfile_to_Gdrive('0BxTfS7jXR_FYTjRyRFBEc3pwOEU'));
    
    
  }catch(e){Logger.log(e);}
}

//USE ID_FOLDER_DRIVE_PARTAGE property script
function get_drive_all_client(){
  var list=[];
 
  var scriptProperties = PropertiesService.getScriptProperties();
  var source = DriveApp.getFolderById(scriptProperties.getProperty('ID_FOLDER_DRIVE_PARTAGE'));
  
  var folders = source.getFolders();
  while (folders.hasNext())
  {
    var folder = folders.next();
    list.push(folder.getName());
    
  }
  
  
  
  return list; 
}

function get_drive_all_dossier(client){
  var list=[];
 
  var scriptProperties = PropertiesService.getScriptProperties();
  var source = DriveApp.getFolderById(scriptProperties.getProperty('ID_FOLDER_DRIVE_PARTAGE'));
  
  var folders = source.getFoldersByName(client);
  
   while (folders.hasNext())
   {
    source = folders.next();
    var subfolders = source.getFolders();
    while( subfolders.hasNext())
    {
      list.push(subfolders.next().getName());
    }
    break;
   }
  Logger.log('return get_drive_all_dossier');Logger.log(list);
  return list; 
}


function make_copy_cdc2template(ref,Id_dest){
    
    var source = DriveApp.getFolderById(ID_FOLDER_FILES), destination;
    var scriptProperties = PropertiesService.getScriptProperties();
   
    destination = DriveApp.getFolderById(Id_dest); // paramètre appel
    source = source.getFoldersByName(ref); // paramètre appel
    
    if(source.hasNext()){
      source = source.next();}
    else{
      return null;
    }
    
    Logger.log(source.getName());
    var array_branch = scriptProperties.getProperty('ID_FOLDER_DRIVE_CDC').split(',');
    for(var i=0;i<array_branch.length;i++){
      destination = destination.getFoldersByName(array_branch[i]);
      if(destination.hasNext()){
        destination = destination.next();}
      else{
        throw 'Template dossier non trouvé: <b>'+array_branch[i]+'</b>non trouvé';
      }
    }
    
   return Copy_DriveAPI(source, destination);  // return number copy files
}

function make_copy_template(client, folder, editors,ref){
  
  if(__DEBUG__) {Logger.log('make_copy_template %s,%s,%s',client,folder,editors);}
  var scriptProperties = PropertiesService.getScriptProperties();
  
  /*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/
  a scripting exception if the folder does not exist or the user does not have permission to access it
  \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
  var source = DriveApp.getFolderById(scriptProperties.getProperty('ID_FOLDER_DRIVE_TEMPLATE'));
  
  var folder_partage = DriveApp.getFolderById(scriptProperties.getProperty('ID_FOLDER_DRIVE_PARTAGE'));
  
  var destination = folder_partage.getFoldersByName(client);
  
   if (!destination.hasNext()) {
    
    
    destination = folder_partage.createFolder(client);
    Logger.log('create copy client to :'+destination.getName());
  }else{
   
    destination = destination.next();
    
  }
  
 
  if (!destination.getFoldersByName(folder).hasNext()) {
    
    
    destination = destination.createFolder(folder);
    Logger.log('create copy template to :'+destination.getName());
    //Copy_DriveAPI(source,DriveApp.createFolder("COPY_TEMPLATE"));
  }
  else {
    
    Logger.log('already copy exist');
    // Traitement : envoie d'un mail erreur dossier cible existant
    
    throw 'Le dossier <b>'+folder+'</b> existe déjà...';
  }
 
  /*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/
  Voir si pertinence de checker les permissions et accès aux folders partagés source/Destination
  \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
  
  var access = source.getSharingAccess();
  
  var yt_privacy;
  // Attempt to preserve permissions from Drive
  switch(access) {
    case DriveApp.Access.PRIVATE:
      yt_privacy = "private";
      break;
    case DriveApp.Access.ANYONE:
      yt_privacy = "public";
      break;
    case DriveApp.Access.ANYONE_WITH_LINK:
      yt_privacy = "unlisted";
      break;
    default:
      yt_privacy = "private";
  }
  if(__DEBUG__) Logger.log("Folder: "+source.getName()+" Access: "+access+" YT privacy: "+yt_privacy);


  /*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/
  REcopie de l'ensemble des accès accordé (liste de mail) ainsi que les niveaux de permission accordés
  \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
  var i;
  var users = source.getEditors();
  
  for (var i=0;i<users.length;i++){
    
    if(__DEBUG__) Logger.log("Folder: "+destination.getName()+" Edit for "+users[i].getEmail()); 
    //destination.addEditor(users[i]);   
  }

  
  users = source.getViewers();
  
  for (var i=0;i<users.length;i++)
  {
    if(__DEBUG__) Logger.log("Folder: "+destination.getName()+" Viewer for "+users[i].getEmail()); 
    //destination.addViewer(users[i]);
  }
  
  //destination.setOwner(source.getOwner());
  //if(__DEBUG__) Logger.log("Folder: "+source.getName()+" Owner:" +source.getOwner().getEmail());
   
  // Ajout des droits pour le demandeur
  if(editors!==undefined) destination.addEditors(editors);
  
 
  Copy_DriveAPI(source,destination);
  
  
  var objet = new SHEET_AO();
  var row = objet.Info_A(ref);
  var objet_log= new OLogger(row.log);
  
  objet.sheet.getRange(row.rowNumber,COLUMN_SHEET_LOG).setValue(objet_log.pushSession('Génération arborescence AVV','INFO',{
                                                                                       folder : new C_Url(destination.getId()),
                                                                                       Partage:editors,}))
              
  
  return destination.getId();
}

