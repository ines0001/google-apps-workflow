

/*

http://templates.mailchimp.com/resources/inline-css/

*/



var TAGS_MAIL= {
  TITLE1 : 0,
  TITEL2 : 1,
  CONTENT: 2,
  BUTTON1_NAME: 3,
  BUTTON1_LINK: 4,
  BUTTON1_VISIBILITY: 5,
  BUTTON2_NAME: 6,
  BUTTON2_LINK: 7,
  BUTTON2_VISIBILITY: 8,
  LOWER_BODY: 9,
  BUTTON1_COLOR: 10,
  BUTTON2_COLOR: 11,

};

var OtemplateMail = {
  html_ : '',
  tags:{tagCode1:'',tagCode2:'',},
  
  init:function(template){
    
    this.html_ =  HtmlService.createTemplateFromFile(template);
    this.html_.pp9_title1='';
    this.html_.pp9_title2='';
    this.html_.pp9_body='*|TAG_MESSAGE_HTML|*';
    this.html_.pp9_tab='*|TAG_CODE_HTML|*';
    this.html_.name_button1='';
    this.html_.name_button2='';
    this.html_.link_button1='';
    this.html_.link_button2='';
    this.html_.title_button1='button1';
    this.html_.title_button2='button2';
    this.html_.pp9_ColorButton1='#000000';
    this.html_.pp9_ColorButton2='#000000';
    this.html_.pp9_button1_display='none';
    this.html_.pp9_button2_display='none';
    this.html_.pp9_link=URL_EXEC+'?page=dashboard';
    this.html_.CURRENT_YEAR='2015';
    this.html_.LIST_COMPANY='SQLI GROUP';
    this.html_.LIST_ADDRESS_HTML=GetEMAIL_CONTACT();
    
  },
  setContent: function(tag,v){
    switch(tag){
      case TAGS_MAIL.TITLE1: this.html_.pp9_title1=v;break;
      case TAGS_MAIL.TITLE2: this.html_.pp9_title2=v;break;
      case TAGS_MAIL.CONTENT: this.tags.tagCode1=v;break;
      case TAGS_MAIL.BUTTON1_NAME: this.html_.name_button1=v;break;
      case TAGS_MAIL.BUTTON1_LINK: this.html_.link_button1=v;break;
      case TAGS_MAIL.BUTTON2_NAME: this.html_.name_button2=v;break;
      case TAGS_MAIL.BUTTON2_LINK: this.html_.link_button2=v;break;
      case TAGS_MAIL.BUTTON1_VISIBILITY: this.html_.pp9_button1_display= (v)?'true':'none';break;
      case TAGS_MAIL.BUTTON2_VISIBILITY: this.html_.pp9_button2_display= (v)?'true':'none';break;
      case TAGS_MAIL.LOWER_BODY: this.tags.tagCode2=v;break;
      case TAGS_MAIL.BUTTON1_COLOR: this.html_.pp9_ColorButton1=v;break;
      case TAGS_MAIL.BUTTON2_COLOR: this.html_.pp9_ColorButton2=v;break;
      
    }
  
    return this},
    
    getContent: function(){
      return this.html_.evaluate()
                    .getContent()
                    .replace('*|TAG_CODE_HTML|*',this.tags.tagCode2)
                    .replace('*|TAG_MESSAGE_HTML|*',this.tags.tagCode1.nl2br());
   
    },



};


function testingMail(){
  try{
  
  var content = '<p>Nous mettons en production prochainement une nouvelle version de la PP9 Web qui prend en compte vos retours :';
  content+='<ul>';
  content+='<li>Nouvelle charte graphique plus claire</li>';
  content+='<li>Nouveau dashboard pour suivre vos AVV et gérer vos actions</li>';
  content+='<li>Accès optimisé depuis votre téléphone</li>';
  content+='<li>Gestion des étapes de Visa Forfait et de DAR, qui sont maintenant uploadés via la PP9 Web</li>';
  
  content+='</ul>';
  content+='N\'hésitez pas à nous faire part de vos retours';
  content+='</p>'; 
  
  
  OtemplateMail.init('template_mail_diffusion');
  OtemplateMail.setContent(TAGS_MAIL.TITLE1,'Nouvelle version de la PP9 Web')
               .setContent(TAGS_MAIL.TITLE2,'Découvrez les dernières nouveautés')
               .setContent(TAGS_MAIL.CONTENT,content)
               
  //var alias = GmailApp.getAliases()[0];
  var advancedArgs = {to: 'eremy@sqli.com',
                      subject:'Nouvelle version de la PP9 Web',
  
                      htmlBody: OtemplateMail.getContent(),
                      //cc: 'eremy@sqli.com',
                      noReply:true,
                      //from:alias,
                      
                     };
  //sendEmail(recipient, subject, body, options)
  if(advancedArgs) MailApp.sendEmail(advancedArgs);
   
  
  
  
 
  }catch(e){Logger.log(e);}

}


/*************************************************************
/ MailingAfterDAR : Notification par mail envoyé auprès des participants
/ après un DAR
/ [in]: liste des destinataires
/ [in]: objet {
                
                
                }
/ [in]: -

/ [out]: true
/**************************************************************/
function MailingAfterDAR(destinataire,option){
  if(__DEBUG__) {Logger.log('MailingAfterDAR to:%-20s\toption:%s',destinataire,JSON.stringify(option,null,null));}
  if(destinataire===undefined || typeof option!='object') throw 'MailingToAdminAskVisa:no values for sendMailing';
  
  var file = DriveApp.getFileById(option.attachements);
  
  
  var content ='<small>de '+Session.getActiveUser().getEmail()+':</small><br>'+option.content;
  
  content+='<hr><a href="'+file.getUrl()+'">Accès au compte-rendu du DAR</a><br>';
  
  OtemplateMail.init('template_mail');
  OtemplateMail.setContent(TAGS_MAIL.TITLE1,option.client+'-'+option.ao)
               .setContent(TAGS_MAIL.TITLE2,'Le DAR a été réalisé')
               .setContent(TAGS_MAIL.CONTENT,content);
  
 
  var advancedArgs = { to: destinataire,
                      subject: SUBJECT_DAR.replace('%%client%%',option.client)
                                    .replace('%%ao%%',option.ao)
                                    .replace('%%date%%',option.remise),
  
                      htmlBody: OtemplateMail.getContent(),
  
                       
                      /*
                       MANTIS 049
                      */
                      noReply:true,
                      attachments:[file.getBlob()],
                     
                     };
  
  
  
  
  if(advancedArgs) MailApp.sendEmail(advancedArgs);
  
  
  
  
  return true;
}

/*************************************************************
/ MailingAfterVISA : Notification par mail envoyé auprès des participants
/ après un VISA FORFAIT
/ [in]: liste des destinataires
/ [in]: objet {
                
                
                }
/ [in]: -

/ [out]: true
/**************************************************************/
function MailingAfterVISA(destinataire,option){
  if(__DEBUG__) {Logger.log('MailingAfterVISA to:%-20s\toption:%s',destinataire,JSON.stringify(option,null,null));}
  if(destinataire===undefined || typeof option!='object') throw 'MailingToAdminAskVisa:no values for sendMailing';
  
  var file = DriveApp.getFileById(option.attachements);
  
  var content ='<small>de '+Session.getActiveUser().getEmail()+':</small><br>'+option.content;
  
  content+='<hr><a href="'+file.getUrl()+'">Accès au compte-rendu PP10</a><br>';
  
  OtemplateMail.init('template_mail');
  OtemplateMail.setContent(TAGS_MAIL.TITLE1,option.client+'-'+option.ao)
               .setContent(TAGS_MAIL.TITLE2,'Le visa forfait a été réalisé')
               .setContent(TAGS_MAIL.CONTENT,content);
  
 
  var advancedArgs = { to: destinataire,
                      subject: SUBJECT_VISA.replace('%%client%%',option.client)
                                    .replace('%%ao%%',option.ao)
                                    .replace('%%date%%',option.remise),
  
                      htmlBody: OtemplateMail.getContent(),
  
                       
                      /*
                       MANTIS 049
                      */
                      noReply:true,
                      cc:option.cc,
                      attachments:[file.getBlob()],
                     
                     };
  
  
  
  
  if(advancedArgs) MailApp.sendEmail(advancedArgs);
  
  
  
  
  return true;
}

/*************************************************************
/ mailingAfterGoNoGo : Notification par mail envoyé après une validation de Go /NO GO
/ le mail est envoyé à une liste de destinataire
/ [in]: liste des destinataires
/ [in]: objet {
        result:'go'/'nogo',
        ao:row.dossier,
        client:row.client,
        remise:date form.remise,
        rp:row.rp,
        title:'',
        comment:mail_text,
        cc:GetEMAIL_DIFFUSION_GO_CC(),
        }
/ [in]: -

/ [out]: -
/**************************************************************/

function mailingAfterGoNoGo(destinataire,option){
  if(__DEBUG__) {Logger.log('mailingAfterGoNoGo to:%-20s\toption:%s',destinataire,JSON.stringify(option,null,null));}
  if(destinataire===undefined || typeof option!='object') throw 'mailingAfterGoNoGo:no values for sendMailing';
  
  OtemplateMail.init('template_mail');
  OtemplateMail.setContent(TAGS_MAIL.TITLE1,option.client+'-'+option.ao)
               .setContent(TAGS_MAIL.TITLE2,'Vous avez une nouvelle notification de '+option.result)
               .setContent(TAGS_MAIL.CONTENT,option.comment);
  
  var file = (option.attachements.length>0)?DriveApp.getFileById(option.attachements):null;
  
  var advancedArgs = {to: destinataire,
                      subject: SUBJECT_DECISION_GONOGO.replace('%%client%%',option.client)
                                                    .replace('%%result%%',option.result)
                                                    .replace('%%ao%%',option.ao)
                                                    .replace('%%date%%',option.remise)
                                                    .replace('%%unit%%','(RP:'+option.rp+')'),
  
                      htmlBody: OtemplateMail.getContent(),
                      
                      cc: option.cc,
                     
                     };
  if(file) { advancedArgs.attachments = [file.getBlob()]; }

  
  if(advancedArgs) MailApp.sendEmail(advancedArgs);
  
  
  
  
  return true;

}

/*************************************************************
/ MailingToAdminAskVisa : Notification par mail envoyé auprès de l'admin pour une demande 
de création d'arborescence AVV ainsi qu'une date de demande de visa forfait
/ [in]: liste des destinataires
/ [in]: objet {
                id:form.reference,
                visa:form.visa,
                ao:form.dossier,
                client:form.client,
                remise:form.remise,
                rp:form.rp,
                
                }
/ [in]: -

/ [out]: true
/**************************************************************/
function MailingToAdminAskVisa(destinataire,option){
  if(__DEBUG__) {Logger.log('MailingToAdminAskVisa to:%-20s\toption:%s',destinataire,JSON.stringify(option,null,null));}
  if(destinataire===undefined || typeof option!='object') throw 'MailingToAdminAskVisa:no values for sendMailing';
  
  OtemplateMail.init('template_mail');
  OtemplateMail.setContent(TAGS_MAIL.TITLE1,option.client+'-'+option.ao)
               .setContent(TAGS_MAIL.TITLE2,'Vous avez reçu une demande de création de dossier partagé ')
               .setContent(TAGS_MAIL.CONTENT,'<p>Une demande de <b>Visa Forfait</b> pour le: '+option.visa+'</p><p>Merci de traiter la demande de création de dossier avant-vente</p>')
               .setContent(TAGS_MAIL.BUTTON1_NAME,'Ajoutez un dossier avant-vente')
               .setContent(TAGS_MAIL.BUTTON1_LINK,URL_EXEC+'?page=build_avv&ref='+option.id)
               .setContent(TAGS_MAIL.BUTTON1_COLOR,'red')
               .setContent(TAGS_MAIL.BUTTON1_VISIBILITY,true);
  
  var advancedArgs = { to: destinataire,
                      subject: SUBJECT.replace('%%client%%',option.client)
                                    .replace('%%ao%%',option.ao)
                                    .replace('%%date%%',option.remise)
                                    .replace('%%unit%%','(RP:'+option.rp+')'),
  
                      htmlBody: OtemplateMail.getContent(),
  
                       
                      /*
                       MANTIS 049
                      */
                      noReply:true,
                     
                     };
  
  
  
  
  if(advancedArgs) MailApp.sendEmail(advancedArgs);
  
  
  
  
  return true;
}

/*************************************************************
/ MailingToAdminAskCreateAVV : Notification par mail envoyé auprès de l'admin pour une demande 
de création d'arborescence AVV uniquement
/ [in]: liste des destinataires
/ [in]: objet {
                {'id':<?=reference?>,
                'reviewer':<?=Session.getActiveUser().getEmail()?>,
                'ao':$('#dossier').val(),
                'client':$('#client').val(),
                'rp':$('#rp').val(),
                'revue':<?=type?>,}
                
                }
/ [in]: -

/ [out]: true
/**************************************************************/
function MailingToAdminAskCreateAVV(destinataire,option){
  if(__DEBUG__) {Logger.log('MailingToAdminAskCreateAVV to:%-20s\toption:%s',destinataire,JSON.stringify(option,null,null));}
  if(destinataire===undefined || typeof option!='object') throw 'MailingToAdminAskCreateAVV:no values for sendMailing';
  
  OtemplateMail.init('template_mail');
  OtemplateMail.setContent(TAGS_MAIL.TITLE1,option.client+'-'+option.ao)
               .setContent(TAGS_MAIL.TITLE2,'Vous avez reçu une demande de '+option.reviewer)
               .setContent(TAGS_MAIL.CONTENT,'<p>Cette demande a été déclenché dans le cadre d\'une notification de fin de <b>'+option.revue+'</b>.<br><br>Il est donc urgent de traiter cette demande dans les plus brefs délais.</p>')
               .setContent(TAGS_MAIL.BUTTON1_NAME,'Ajoutez un dossier avant-vente')
               .setContent(TAGS_MAIL.BUTTON1_LINK,URL_EXEC+'?page=build_avv&ref='+option.id)
               .setContent(TAGS_MAIL.BUTTON1_COLOR,'red')
               .setContent(TAGS_MAIL.BUTTON1_VISIBILITY,true);
  
  var advancedArgs = { to: destinataire,
                      subject: SUBJECT.replace('%%client%%',option.client)
                                    .replace('%%ao%%',option.ao)
                                    //.replace('%%date%%',option.remise)
                                    .replace('%%unit%%','(RP:'+option.rp+')'),
  
                      htmlBody: OtemplateMail.getContent(),
  
                       
                      /*
                       MANTIS 049
                      */
                      noReply:true,
                     
                     };
  
  
  
  
  if(advancedArgs) MailApp.sendEmail(advancedArgs);
  
  
  
  
  return true;
}

/*************************************************************
/ MailingToRP : Notification par mail Envoyer au RP afin qu'une action de 
/ Go NOGO soit prise 
/ [in]: emetteur
/ [in]: objet {client:row.client,
              ao:row.dossier,
              unit:row_b.unit,
              date:(row_b.remise===undefined )?'':Utilities.formatDate(row_b.remise, "GMT+02:00", "dd/MM/yyyy"),
              diffusion:(row.dateheureMission===undefined )?'':Utilities.formatDate(row.dateheureMission, "GMT+02:00", "dd/MM/yyyy"),
              go:form.date,
              url:row.url,
              id:row.identifiant,
              sales:row.emetteur,
              
              manager:manager
              }
/ [in]: -

/ [out]: true
/**************************************************************/
function MailingToRP(emetteur,option){
  
  if(__DEBUG__) {Logger.log('MailingToRP to:%-20s\toption:%s',emetteur,JSON.stringify(option,null,null));}
  if(emetteur===undefined || typeof option!='object') throw 'MailingToRP:no values for sendMailing';
 
  var mail = '<p>Bonjour,<p>';
  
  mail+= '<p>Vous êtes positionné par votre manager en tant que Responsable de Proposition sur le dossier suivant :</p>';
  mail+='<p><b>Client: </b>'+option.client+'<br>';
  mail+='<b>Dossier: </b>'+option.ao+'<br>';
  mail+='<b>Sales: </b>'+option.sales+'<br>';
  mail+='<b>Date de diffusion du dossier: </b>'+option.diffusion+'<br>';
  
  mail+='<b>Date de Go/NoGo:</b>'+option.go+'<br>';
  mail+='<b>Date de remise:</b>'+option.date+'<br>';
  if(option.url) 
    mail+='<a href="'+option.url+'">Accès au cahier des charges :</a><br>';
  mail+='<br>';
  //mail+= '<p><u>Une fois le Go/no Go réalisé</u>, vous devez demander la création de l\'arborescence Avant-vente GDrive, ou bien donner les raisons du No Go.</p>'  
   
  
  OtemplateMail.init('template_mail');
  OtemplateMail.setContent(TAGS_MAIL.TITLE1,option.client+'-'+option.ao)
               .setContent(TAGS_MAIL.TITLE2,'Vous devez organiser un GO/ NOGO pour le '+option.go)
               .setContent(TAGS_MAIL.CONTENT,mail)
               .setContent(TAGS_MAIL.BUTTON1_NAME,'Valider le dossier par un GO')
               .setContent(TAGS_MAIL.BUTTON1_LINK,URL_EXEC+'?page=decision&result=go&ref='+option.id)
               .setContent(TAGS_MAIL.BUTTON1_COLOR,'red')
               .setContent(TAGS_MAIL.BUTTON1_VISIBILITY,true)
               .setContent(TAGS_MAIL.BUTTON2_NAME,'Clore le dossier par un NOGO')
               .setContent(TAGS_MAIL.BUTTON2_LINK,URL_EXEC+'?page=decision&result=nogo&ref='+option.id)
               .setContent(TAGS_MAIL.BUTTON2_COLOR,'grey')
               .setContent(TAGS_MAIL.BUTTON2_VISIBILITY,true);
 
  
  
  
  
  
  var advancedArgs = {to: emetteur,
                      subject:SUBJECT.replace('%%client%%',option.client)
                                    .replace('%%ao%%',option.ao)
                                    .replace('%%date%%',option.date)
                                    .replace('%%unit%%',option.unit),
  
                      htmlBody: OtemplateMail.getContent(),
                      /*
                      BugFix : MANTIS 0032 + MANTIS 0036
                      
                      */
                      cc: option.manager+','+GetEMAIL_NOTIFICATION()
                     };
  
 
  
  if(advancedArgs) MailApp.sendEmail(advancedArgs);
  
  return true;
}


/*************************************************************
/ MailingRelanceToManager : Notification par mail Envoyer au
/ le manager pressenti par mail suivant la référence au dossier
/ [in]: liste des destinataires
/ [in]: objet {ao:row.dossier,
              date:(row.dateheureMission===undefined )?'':Utilities.formatDate(row.dateheureMission, "GMT+02:00", "dd/MM/yyyy"),
              client:row.client,
              comment:b,
              id:a,
              }
/ [in]: -

/ [out]: true
/**************************************************************/
function MailingRelanceToManager(destinataire,option){
  if(__DEBUG__) {Logger.log('MailingRelanceToManager to:%-20s\toption:%s',destinataire,JSON.stringify(option,null,null));}
  if(destinataire===undefined || typeof option!='object') throw 'MailingRelanceToManager:no values for sendMailing';
  
  var mail ='<p>Bonjour,<p>';
  mail+='<p>Le dossier '+option.client+'-'+option.ao+' est actuellement <b>EN ATTENTE</b> d\'affectation d\'un responsable de proposition.</p>' 
  mail+=ALERTE_MESSAGE_INLINE('<small>de '+Session.getActiveUser().getEmail()+':</small><br>'+option.comment);
  
  mail+='<p>Merci de compléter le formulaire depuis le lien ci-dessous.</p>';
  
  OtemplateMail.init('template_mail');
  OtemplateMail.setContent(TAGS_MAIL.TITLE1,option.client+'-'+option.ao )
               .setContent(TAGS_MAIL.TITLE2,'Vous avez un dossier à traiter')
               .setContent(TAGS_MAIL.CONTENT,mail)
               .setContent(TAGS_MAIL.BUTTON1_NAME,'Traiter le dossier')
               .setContent(TAGS_MAIL.BUTTON1_LINK,URL_EXEC+'?page=response&ref='+option.id)
               .setContent(TAGS_MAIL.BUTTON1_COLOR,'red')
               .setContent(TAGS_MAIL.BUTTON1_VISIBILITY,true);
 
  
  var advancedArgs = {to: destinataire,
                      subject:SUBJECT_ADMIN_RELANCE.replace('%date%',option.date)
                              .replace('%dossier%',option.ao),
  
                      htmlBody: OtemplateMail.getContent(),
                      cc: option.cc,
                      noReply:true,
                     
                     };
  
 
  
  if(advancedArgs) MailApp.sendEmail(advancedArgs);
 
  return true;
}

/*************************************************************
/ MailingRelanceToGo : Notification par mail Envoyerle responsable 
/ de proposition sur un dépassement de délais / date du Go
/ [in]: liste des destinataires
/ [in]: objet {ao:row.dossier,
              date:(row.dateGoNogo===undefined )?'':Utilities.formatDate(row.dateGoNogo, "GMT+02:00", "dd/MM/yyyy"),
              client:row.client,
              comment:b,
              id:a,
              }
/ [in]: -

/ [out]: true
/**************************************************************/
function MailingRelanceToGo(destinataire,option){
   if(__DEBUG__) {Logger.log('MailingRelanceToGo to:%-20s\toption:%s',destinataire,JSON.stringify(option,null,null));}
  if(destinataire===undefined || typeof option!='object') throw 'MailingRelanceToGo:no values for sendMailing';
  
  
  var mail='<p>Le dossier '+option.client+'-'+option.ao+' est actuellement <b>EN ATTENTE</b> de GO / NO GO depuis le '+option.date+'.</p>' 
  mail+=ALERTE_MESSAGE_INLINE('<small>de '+Session.getActiveUser().getEmail()+':</small><br>'+option.comment);
  
  mail+='<p>Merci de compléter le formulaire depuis les liens ci-dessous.</p>';
  
  OtemplateMail.init('template_mail');
  OtemplateMail.setContent(TAGS_MAIL.TITLE1,option.client+'-'+option.ao)
               .setContent(TAGS_MAIL.TITLE2,'Vous avez un dossier à traiter')
               .setContent(TAGS_MAIL.CONTENT,mail)
               .setContent(TAGS_MAIL.BUTTON1_NAME,'Valider le dossier par un GO')
               .setContent(TAGS_MAIL.BUTTON1_LINK,URL_EXEC+'?page=decision&result=go&ref='+option.id)
               .setContent(TAGS_MAIL.BUTTON1_COLOR,'red')
               .setContent(TAGS_MAIL.BUTTON1_VISIBILITY,true)
               .setContent(TAGS_MAIL.BUTTON2_NAME,'Clore le dossier par un NOGO')
               .setContent(TAGS_MAIL.BUTTON2_LINK,URL_EXEC+'?page=decision&result=nogo&ref='+option.id)
               .setContent(TAGS_MAIL.BUTTON2_COLOR,'grey')
               .setContent(TAGS_MAIL.BUTTON2_VISIBILITY,true);
  
 
 
  
  var advancedArgs = {to: destinataire,
                      subject:SUBJECT_ADMIN_RELANCE_GO.replace('%date%',option.date)
                                .replace('%dossier%',option.ao),
  
                      htmlBody: OtemplateMail.getContent(),
                      cc: option.cc,
                      noReply:true,
                     
                     };
  
 
  
  if(advancedArgs) MailApp.sendEmail(advancedArgs);
 
  return true;
}

/*************************************************************
/ MailingtoComment : Notification par mail Envoyerle responsable 
/ de proposition sur un dépassement de délais / date du Go
/ [in]: liste des destinataires
/ [in]: objet {ao:row.dossier,
              client:row.client,
              comment:b,
              id:a,
              }
/ [in]: -

/ [out]: true
/**************************************************************/
function MailingtoComment(destinataire,option){
   if(__DEBUG__) {Logger.log('MailingtoComment to:%-20s\toption:%s',destinataire,JSON.stringify(option,null,null));}
  if(destinataire===undefined || typeof option!='object') throw 'MailingtoComment:no values for sendMailing';
 
  
  OtemplateMail.init('template_mail');
  OtemplateMail.setContent(TAGS_MAIL.TITLE1,option.client+'-'+option.ao)
               .setContent(TAGS_MAIL.TITLE2,'Un commentaire vient d\'être ajouté par '+ Session.getActiveUser().getEmail())
               .setContent(TAGS_MAIL.CONTENT,option.comment);
               
  
 
 
  
  var advancedArgs = {to: destinataire,
                      subject:SUBJECT_COMMENT.replace('%%date%%',option.date)
                                .replace('%%dossier%%',option.ao)
                                .replace('%%client%%',option.client),
  
                      htmlBody: OtemplateMail.getContent(),
                      noReply:true,
                     
                     };
  
 
  
  if(advancedArgs) MailApp.sendEmail(advancedArgs);
 
  return true;
}


/*************************************************************
/ MailingToSales : Notification par mail Envoyer au sales pour 
/ luiindiquer qu'un RP a été positionné
/ [in]: emetteur
/ [in]: objet {client:row.client,
                ao:row.dossier,
                //Begin Bug Fix MANTIS 13
                unit:row_b.unit,
                // End Bug Fix
                date:(row_b.remise===undefined )?'':Utilities.formatDate(row_b.remise, "GMT+02:00", "dd/MM/yyyy"),
                diffusion:(row.dateheureMission===undefined )?'':Utilities.formatDate(row.dateheureMission, "GMT+02:00", "dd/MM/yyyy"),
                bodymail:form.commentaire_sale,
                rp:form.selectrp,
                go:form.date,
                url:row.url,
                id:row.identifiant
                }
/ [in]: -

/ [out]: true
/**************************************************************/
function MailingToSales(emetteur,option){
  
  if(emetteur===undefined || typeof option!='object') throw 'MailingToSales:no values for sendMailing';
  var mail='';
  
  if(__DEBUG__) {Logger.log('MailingToSales to:%-20s\toption:%s',emetteur,JSON.stringify(option,null,null));}

  var mail='<p>Le dossier <b>'+option.client+'-'+option.ao+'</b> est pris en charge par <b>'+option.rp+'</b> suivant ';
  mail+='une date de Go/NoGo planifiée au <b>' +option.go+'</b></p>';
  
 
  OtemplateMail.init('template_mail');
  OtemplateMail.setContent(TAGS_MAIL.TITLE1,option.client+'-'+option.ao)
               .setContent(TAGS_MAIL.TITLE2,'Votre dossier est désormais suivi par un responsable de proposition' )
               .setContent(TAGS_MAIL.CONTENT,mail);
               
  
  var advancedArgs = {to: emetteur,
                      subject:SUBJECT.replace('%%client%%',option.client)
                                    .replace('%%ao%%',option.ao)
                                    .replace('%%date%%',option.date)
                                    .replace('%%unit%%',option.unit),
  
                      htmlBody: OtemplateMail.getContent(),
                      /*
                      Modification : MANTIS 0039
                      */
                      
                      cc: GetEMAIL_ADMIN()+','+option.rp
                     };
  
 
  
  if(advancedArgs) MailApp.sendEmail(advancedArgs);
  
  return true;
}

/*************************************************************
/ MailingToOtherManager : Notification par mail Envoyer à un nouveau 
/ manager pressenti afin de lui proposer le formulaire de prise en charge
/ [in]: emetteur
/ [in]: objet {client:row.client,
                ao:row.dossier,
                
                unit:row_sheet.unit,
                
                date:row_sheet.remise,
                
                emetteur:row.emetteur,
                identifiant:row.identifiant,
                bodymail:row_sheet.message,
                
                manager:form.selectunit,
                
                
                previous_manager:Session.getActiveUser().getEmail(),
                info_complementaire: form.commentaire_manager,
                
                }
/ [in]: -

/ [out]: true
/**************************************************************/
function MailingToOtherManager(emetteur,option){
  if(emetteur===undefined || typeof option!='object') throw 'MailingToOtherManager:no values for sendMailing';
  var mail='',arbitrage_enum = enumParams(COLUMN_ARBITRAGE);
  
  if(__DEBUG__){ Logger.log('MailingToOtherManager to:%-20s\toption:%s',emetteur,JSON.stringify(option,null,null));}

  mail+=ALERTE_MESSAGE_INLINE(' Le manager pressenti pour répondre à ce dossier (<b>'+option.previous_manager+'</b>), l\'a redirigé vers <b>'+option.manager+'</b>'); 
  
  
  mail+=INFO_MESSAGE_INLINE('<small>de '+Session.getActiveUser().getEmail()+':</small><br>'+option.info_complementaire);
  
  mail+='<small>de '+option.emetteur+':</small><br>';
  mail+= option.bodymail;
  mail+='<br>';
  mail+='<p>Merci de compléter le formulaire depuis les liens ci-dessous.</p>';
  
  OtemplateMail.init('template_mail');
  OtemplateMail.setContent(TAGS_MAIL.TITLE1,option.client+'-'+option.ao )
               .setContent(TAGS_MAIL.TITLE2,'Vous avez un dossier à traiter')
               .setContent(TAGS_MAIL.CONTENT,mail)
               .setContent(TAGS_MAIL.BUTTON1_NAME,'Traiter le dossier')
               .setContent(TAGS_MAIL.BUTTON1_LINK,(arbitrage_enum.indexOf(option.unit)!=-1)?URL_EXEC+'?page=response&type=expanded&ref='+option.identifiant:URL_EXEC+'?page=response&ref='+option.identifiant)
               .setContent(TAGS_MAIL.BUTTON1_COLOR,'red')
               .setContent(TAGS_MAIL.BUTTON1_VISIBILITY,true)
               .setContent(TAGS_MAIL.LOWER_BODY,GetGridPP9Html(option.identifiant));
 
  
  var advancedArgs = {to: option.manager,
                      subject:SUBJECT.replace('%%client%%',option.client)
                                  .replace('%%ao%%',option.ao)
                                  .replace('%%date%%', getDate(option.date))
                                  .replace('%%unit%%',option.unit),
  
                      htmlBody: OtemplateMail.getContent(),
                      cc: GetEMAIL_CC() +','+emetteur,
                      
                     };
  
  if(advancedArgs) MailApp.sendEmail(advancedArgs);

  return true;
}

/*************************************************************
/ MailingToManager : Notification par mail Envoyer à un nouveau 
/ manager pressenti afin de lui proposer le formulaire de prise en charge
/ [in]: emetteur
/ [in]: identifiant du dossier
/ [in]: contenu du formulaire
/ [in]: string message du demandeur
/ [in]: true: envoie de mail uniquement
/ [out]: advancedArgs structure mail
/**************************************************************/
function MailingToManager(emetteur,id,values,mail,option){
  
  if(values===undefined || typeof values!='object') throw 'MailingToManager:no values for sendMailing';
  if(__DEBUG__) Logger.log('MailingToManager: emeteur:%s id:%s',emetteur,id);
  if(__DEBUG__) Logger.log('MailingToManager: values %s',JSON.stringify(values,null,null));
  
 
  var arbitrage_enum = enumParams(COLUMN_ARBITRAGE);
  
  
  
  OtemplateMail.init((option)?'template_mail':'template_mail_preview');
  OtemplateMail.setContent(TAGS_MAIL.TITLE1, values.find('client')+'-'+values.find('ao') )
              .setContent(TAGS_MAIL.TITLE2,'Vous avez un dossier à traiter')
              .setContent(TAGS_MAIL.CONTENT,mail)
              .setContent(TAGS_MAIL.BUTTON1_NAME,'Traiter le dossier')
              .setContent(TAGS_MAIL.BUTTON1_LINK,(option)?(arbitrage_enum.indexOf(values.find('unit'))!=-1)?URL_EXEC+'?page=response&type=expanded&ref='+id:URL_EXEC+'?page=response&ref='+id:'#')
              .setContent(TAGS_MAIL.BUTTON1_COLOR,'red')
              .setContent(TAGS_MAIL.BUTTON1_VISIBILITY,true)
              .setContent(TAGS_MAIL.LOWER_BODY,(option)?GetGridPP9Html(id):GetGridPP9Html_v(values));
  
  
  var advancedArgs = {to: GetManager(values.find('unit')),
                      subject:SUBJECT.replace('%%client%%',values.find('client'))
                                    .replace('%%ao%%',values.find('ao'))
                                    .replace('%%date%%',values.find('date'))
                                    .replace('%%unit%%',values.find('unit')),
  
                      htmlBody: OtemplateMail.getContent(),
                      cc: GetEMAIL_CC() +','+emetteur
                     };
  
  if(option&&advancedArgs) MailApp.sendEmail(advancedArgs);
  
  return advancedArgs;
}

/*************************************************************
/ Gridpp9ToHtml : Fonction permettant de produire un flux html
/ pour la mise en forme sous forme de tableau des données
/ de création d'une fiche AO
/ [in]: objet contenant toutes le détail de la fiche ao
/ [in]: 
/ [in]: 

/ [out]: flux html formaté
/**************************************************************/
function templateGridPP9(values){
  if(values===undefined || typeof values!='object') throw 'Gridpp9ToHtml: no values for template';
  var html = HtmlService.createTemplateFromFile('mailchimp_grid_pp9');
  
  html.client= values.client;
  html.ao = values.ao;
  html.contexte = '%%contexte%%' //values.contexte;
  html.enjeux = '%%enjeux%%' //values.enjeux;
  html.unit = values.unit;
  html.budget = currencyFormatDE(values.budget);
  html.date = values.date;
  html.ic = values.indice;
  html.criteres = '%%critere%%'   //values.critere;
  html.origine = '%%origine%%'   //values.origine;
  html.pourquoi = '%%pourquoi%%'  //values.pourquoi;
  html.partenaires = values.partenaires;
  html.concurrents = values.concurrents;
  html.crm = values.crm;
  html.sales = values.emetteur;
  html.techno = values.techno;
  
  return html.evaluate().getContent()
                      .replace('%%contexte%%',(values.contexte==undefined)?'':values.contexte.nl2br())
                      .replace('%%enjeux%%',(values.enjeux==undefined)?'':values.enjeux.nl2br())
                      .replace('%%critere%%',(values.critere==undefined)?'':values.critere.nl2br())
                      .replace('%%origine%%',(values.origine==undefined)?'':values.origine.nl2br())
                      .replace('%%pourquoi%%',(values.pourquoi==undefined)?'':values.pourquoi.nl2br());

}



function MailContact(str){
   MailApp.sendEmail( GetEMAIL_CONTACT(), 'PP9-WEB: Questions utilisateurs', str );
}


String.prototype.nl2br = function()
{
    return this.replace(/(\n)/g, "<br />");
}

