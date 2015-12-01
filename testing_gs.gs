function my_test(){
  var regex = /<a.*?>(.*?)<\/a>/gi;
  var value = '<a href=&apos;https://d=docs.google&.com/a/sqli.com/folderview?id=0B0WdP5H8Zj_6cXdHUW5HWmhSbVU&usp=drivesdk&apos; target=&apos;_blank&apos;>20150812-HERMES-INTRANET</a>';
  
  var ID = regex.exec(value);
  
  Logger.log(ID[1]);

}