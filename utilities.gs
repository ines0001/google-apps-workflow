//////////////////////////////////////////////////////////////////////////////////////////
//
// The code below is reused from the 'Reading Spreadsheet data using JavaScript Objects'
// tutorial.
//
//////////////////////////////////////////////////////////////////////////////////////////



/*/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/
    HISTORY Serialisation des appels/traitements
         
/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
function OLogger(s){
  
  if( typeof(s) === 'string' || s instanceof String ){
    this.sessions = JSON.parse(s);
    
  }
  else this.sessions = [];
  
  this.length = this.sessions.length;
}

OLogger.prototype = {
  
  pushSession:function(operation, state, comment ){
    var session ={};
    session.date = new Date();
    session.user = Session.getActiveUser().getEmail();
    session.operation = operation;
    session.state = state;
    session.comment = comment;
    this.sessions.push(session);
    if( typeof comment === 'object' ){
        //if( comment.hasOwnProperty('client') && comment.hasOwnProperty('dossier')) 
          Logger.warning('[%s] PAR %-20s \tETAT:%s\tDETAIL:%s',operation||'',session.user||'',state||'',JSON.stringify(comment));
    }
    else
      Logger.warning('[%s] PAR %-20s\tETAT:%s',operation||'',session.user||'',state||'');
    /*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/
     Nécessité de convertir tous les caractères accentués de type ' et " afin de ne pas générer d'erreur
     de lecture sur des recopie de d'attribut de balise
     ex : <a href="#" data-history="JSON.stringify"><\a>
     /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
    return JSON.stringify(this.sessions,function(key, valeur) {
                          if (typeof valeur === "string") {
                            
                            replaced = valeur.replace(/(["'\n])/g, function(m, group1) {
                              if (group1 == "" ) return m;
                              else {return "&apos;";}
                            });
                            
                            return replaced;
                          
                          }
                          return valeur;});
    
  },
  
  /*********************************************
  Fonction permettant de lire la dernière opération 
  <name> depuis l'objet TimeLine
  
  [in]: nom de l'opération
  [out]: objet de l'opération, null sinon 
  **********************************************/
  getSession:function( name){
    var session={};
    var regex = new RegExp(name, "gi");
    
    
    for(var i=this.length;i>0;i--) 
      if (this.sessions[i-1].operation.match(regex)){
        // match i-1 position trouvé
        session = this.sessions[i-1];
        break;
      }
    
    
    return session
  },
  
  /*********************************************
  Fonction permettant de lire l'ID du dossier rattaché à l'objet TimeLine
  [in]: objet TimeLine
  [in]: nom de l'opération
  [out]: objet de l'opération, null sinon 
  **********************************************/
  getSessionKey:function ( obj,key){
    var str=null;
    for (var p in obj) {
      if(typeof obj[p] == 'object') str = this.getSessionKey(obj[p],key);
      if(str) break;
      if(obj.hasOwnProperty(key)){
        str = obj[key];
        break;
      }
    }
    return str;
  
  },
  
}


// Define Specific URL CLass
function C_Url(ID) {
  if(__DEBUG__) Logger.log('Nouvel objet Url- ID:%s',ID);
  if(ID=='') return;
  this.ID = ID;
  this.URL = getUrl(ID);
  this.NAME = getFilename(ID);
  
}

function utilities_testing(){
 Logger.log(currencyFormatDE(currencyFormatNum('898 789 €')));
 Logger.log(CheckEmail('eremy@sqli.com,'));
 //Logger.log(o);
  
}




//\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\

//cleanArray removes all duplicated elements
function cleanArray(array) {
  var i, j, len = array.length, out = [], obj = {};
  for (i = 0; i < len; i++) {
    if(array[i]!='') obj[array[i]] = 0;
  }
  for (j in obj) {
    out.push(j);
  }
  return out;
}

Array.prototype.find = function(value)
{
  var out='',obj ={};
  
  for (var index in this){
    obj = this[index];
    if(obj.name==value) {out=(obj.value);break;} 
  }  
  return out;
}


/**
 * Transposes a given array.
 * @id Array.prototype.transpose
 * @author Shamasis Bhattacharya
 *
 * @type Array
 * @return The Transposed Array
 * @compat=ALL
 */
Array.prototype.transpose = function() {
 
  // Calculate the width and height of the Array
  var a = this,
    w = a.length ? a.length : 0,
    h = a[0] instanceof Array ? a[0].length : 0;
 
  // In case it is a zero matrix, no transpose routine needed.
  if(h === 0 || w === 0) { return []; }
 
  /**
   * @var {Number} i Counter
   * @var {Number} j Counter
   * @var {Array} t Transposed data is stored in this array.
   */
  var i, j, t = [];
 
  // Loop through every item in the outer array (height)
  for(i=0; i<h; i++) {
 
    // Insert a new row (array)
    t[i] = [];
 
    // Loop through every item per item in outer array (width)
    for(j=0; j<w; j++) {
 
      // Save transposed data.
      t[i][j] = a[j][i];
    }
  }
 
  return t;
};


// getRowsData iterates row by row in the input range and returns an array of objects.
// Each object contains all the data for a given row, indexed by its normalized column name.
// Arguments:
//   - sheet: the sheet object that contains the data to be processed
//   - range: the exact range of cells where the data is stored
//   - columnHeadersRowIndex: specifies the row number where the column names are stored.
//       This argument is optional and it defaults to the row immediately above range;
// Returns an Array of objects.
function getRowsData(sheet, range, columnHeadersRowIndex) {
  columnHeadersRowIndex = columnHeadersRowIndex || range.getRowIndex() - 1;
  var numColumns = range.getEndColumn() - range.getColumn() + 1;
  var headersRange = sheet.getRange(columnHeadersRowIndex, range.getColumn(), 1, numColumns);
  var headers = headersRange.getValues()[0];
  return getObjects(range.getValues(), normalizeHeaders(headers));
}

// For every row of data in data, generates an object that contains the data. Names of
// object fields are defined in keys.
// Arguments:
//   - data: JavaScript 2d array
//   - keys: Array of Strings that define the property names for the objects to create
function getObjects(data, keys) {
  var objects = [];
  for (var i = 0; i < data.length; ++i) {
    var object = {};
    var hasData = false;
    for (var j = 0; j < data[i].length; ++j) {
      var cellData = data[i][j];
      if (isCellEmpty(cellData)) {
        continue;
      }
      object[keys[j]] = cellData;
      hasData = true;
    }
    if (hasData) {
      objects.push(object);
    }
  }
  return objects;
}

// Returns an Array of normalized Strings.
// Arguments:
//   - headers: Array of Strings to normalize
function normalizeHeaders(headers) {
  var keys = [];
  for (var i = 0; i < headers.length; ++i) {
    var key = normalizeHeader(headers[i]);
    if (key.length > 0) {
      keys.push(key);
    }
  }
  return keys;
}

// Normalizes a string, by removing all alphanumeric characters and using mixed case
// to separate words. The output will always start with a lower case letter.
// This function is designed to produce JavaScript object property names.
// Arguments:
//   - header: string to normalize
// Examples:
//   "First Name" -> "firstName"
//   "Market Cap (millions) -> "marketCapMillions
//   "1 number at the beginning is ignored" -> "numberAtTheBeginningIsIgnored"
function normalizeHeader(header) {
  var key = "";
  var upperCase = false;
  for (var i = 0; i < header.length; ++i) {
    var letter = header[i];
    if (letter == " " && key.length > 0) {
      upperCase = true;
      continue;
    }
    if (!isAlnum(letter)) {
      continue;
    }
    if (key.length == 0 && isDigit(letter)) {
      continue; // first character must be a letter
    }
    if (upperCase) {
      upperCase = false;
      key += letter.toUpperCase();
    } else {
      key += letter.toLowerCase();
    }
  }
  return key;
}

// Returns true if the cell where cellData was read from is empty.
// Arguments:
//   - cellData: string
function isCellEmpty(cellData) {
  return typeof(cellData) == "string" && cellData == "";
}

// Returns true if the character char is alphabetical, false otherwise.
function isAlnum(char) {
  return char >= 'A' && char <= 'Z' ||
    char >= 'a' && char <= 'z' ||
    isDigit(char);
}

// Returns true if the character char is a digit, false otherwise.
function isDigit(char) {
  return char >= '0' && char <= '9';
}


/**************************************************************************/
// Convertion format date aaaa-mm-jj  jj/mm/aaaa
/**************************************************************************/
function getDate(idate)
{
  

  if( (idate==undefined || idate.constructor!=Date) ) throw 'Error format date';
  var d = (idate==undefined || idate.constructor!=Date)?new Date():idate;
                       
	var m = d.getMonth()+1;          
	var j = d.getDate(); 

	var a = d.getFullYear(); 
	var m_s = String(m);
	var j_s = String(j);

	if (m_s.length == 1)
	{
		m_s = "0".concat(m_s);
	}
	
	if (j_s.length == 1)
	{
		j_s = "0".concat(j_s);
	}
			
	
return ""+j_s+"/"+m_s+"/"+a+"";
}

/**************************************************************************/
// Convertion format date aaaa-mm-jj  jj/mm/aaaa
/**************************************************************************/
function getNameinEmail(email)
{
 var t = email.split('@');
 return t[0]; 
}


/*************************************************************
/ currencyFormatDE : fonction convertissant une valeur monétaire
/ en Euro
/ Ex : 1234567.89)); // output 1.234.567,89 €
/ [in]: value
/ [in]: 
/ [in]: 

/ [out]: string
/**************************************************************/
function currencyFormatDE (num) {
    return num
       .toFixed(0) // always two decimal digits
       .replace(".", ",") // replace decimal point character with ,
       .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.") + " €" // use . as a separator
}

/*************************************************************
/ currencyFormatNum : fonction convertissant une valeur monétaire
/ sous la forme 1 234 567 89 € en valeur numérique

/ [in]: string
/ [in]: 
/ [in]: 

/ [out]: numeric
/**************************************************************/
function currencyFormatNum (v) {
  return parseInt(v.replace(/[\s\€]/g,''),10);
}

function CheckEmail(email){
     var reg = new RegExp('^[a-z0-9]+([_|\.|-]{1}[a-z0-9]+)*@[a-z0-9]+([_|\.|-]{1}[a-z0-9]+)*[\.]{1}[a-z]{2,6}$', 'i');
     if(reg.test(email)) return(true);
     else return(false);
  }



