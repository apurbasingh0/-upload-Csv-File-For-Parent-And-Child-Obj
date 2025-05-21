public with sharing class UploadTargetManagementCSVFileController {

    @AuraEnabled
    public static String inserttargetRecordsRecords(String targetLst){
        system.debug('ASSIGNED_USER__C: ' + targetLst);
        List<OptionsWrapper> targetList = (List<OptionsWrapper>) JSON.deserialize(targetLst, List<OptionsWrapper>.class);
        
        // Insert the target records with their updated YTD target lookup fields
        List<Target_Managment__c> targetmgmtList = new List<Target_Managment__c>();
        Map<String, Target_Managment__c> dataMap = new Map<String, Target_Managment__c>();
        for (OptionsWrapper tg : targetList) {
            Target_Managment__c targetRec = new Target_Managment__c();
            targetRec.Name = tg.Name;
            targetRec.ASSIGNED_USER__C = tg.AssignedUser;
            targetRec.Email__c = tg.Email;
            system.debug('Target record: ' + targetRec);
            
            // Check if the Map already contains a record with the same Name value
            if (!dataMap.containsKey(targetRec.Email__c)) {
                dataMap.put(targetRec.Email__c, targetRec);
                targetmgmtList.add(targetRec);
            }
        }
        
        if (targetmgmtList.size() > 0) {
            upsert targetmgmtList;
        }
        
        List<YTD_Target__c> ytdTargetList = new List<YTD_Target__c>();
        
        //Loop through each target record and create a corresponding YTD target record
        for (OptionsWrapper target : targetList) {
            Target_Managment__c parentRecord = dataMap.get(target.Email);
            if(parentRecord != null) {
                YTD_Target__c ytdTarget = new YTD_Target__c();
                ytdTarget.Target_Managment__c = parentRecord.Id;
                ytdTarget.Q1__c = target.Q1;
                ytdTarget.Q2__c = target.Q2;
                ytdTarget.Q3__c = target.Q3;
                ytdTarget.Q4__c = target.Q4;
                ytdTarget.Target_Type__c = target.TargetType;
                ytdTarget.Finalcial_Year__c = target.FinalcialYear;
                ytdTargetList.add(ytdTarget);
            }
        }
        
        // Insert the YTD target records first, to avoid potential reference errors
        if (ytdTargetList.size() > 0) {
            insert ytdTargetList;
        }
    
        return 'success';
    }

@AuraEnabled 
public static string insertAchievedRecsFunction(String targetLst){
    system.debug('ASSIGNED_USER__C: ' + targetLst);
    List<OptionsWrapper> dataList = (List<OptionsWrapper>) JSON.deserialize(targetLst, List<OptionsWrapper>.class);

    Map<String, Target_Managment__c> dataMap = new Map<String, Target_Managment__c>();
    
    Set<String> emailSet = new Set<String>();
    for(OptionsWrapper trEmail : dataList){
        emailSet.add(trEmail.Email);
        System.debug('emailSet ::'+emailSet);
    }
    List<Target_Managment__c> targetmgmtList = [Select Id,ASSIGNED_USER__C ,Email__c from Target_Managment__c Where Email__c IN : emailSet];
    System.debug('targetmgmtList: ' + targetmgmtList);

    for(Target_Managment__c trm : targetmgmtList){
        dataMap.put(trm.Email__c ,trm );
        }
        List<YTD_Achieved__c> ytdAchievedList = new List<YTD_Achieved__c>();
        
        //Loop through each target record and create a corresponding YTD Achieved record
        for (OptionsWrapper target : dataList) {
            Target_Managment__c parentRecord = dataMap.get(target.Email);
            if(parentRecord != null) {
                YTD_Achieved__c ytdAchieved = new YTD_Achieved__c();
                ytdAchieved.Target_Managment__c = parentRecord.Id;
                ytdAchieved.Q1__c = target.Q1;
                ytdAchieved.Q2__c = target.Q2;
                ytdAchieved.Q3__c = target.Q3;
                ytdAchieved.Q4__c = target.Q4;
                ytdAchieved.Achieved_Type__c = target.AchievedType;
                ytdAchieved.Financial_Year__c = target.FinalcialYear;
                ytdAchievedList.add(ytdAchieved);
            }
        }
        
        // Insert the YTD Achieved records first, to avoid potential reference errors
        if (ytdAchievedList.size() > 0) {
            insert ytdAchievedList;
        }
    
        return 'success';
    }

    public class OptionsWrapper{
        @AuraEnabled public String AssignedUser {get;set;}
        @AuraEnabled public String Name {get;set;}
        @AuraEnabled public String Email {get;set;}
        @AuraEnabled public String EmployeeCode {get;set;}
        @AuraEnabled public String FinalcialYear {get;set;}
        @AuraEnabled public Decimal Q1 {get;set;}
        @AuraEnabled public Decimal Q2 {get;set;}
        @AuraEnabled public Decimal Q3 {get;set;}
        @AuraEnabled public Decimal Q4 {get;set;}
        @AuraEnabled public String TargetType {get;set;}
        @AuraEnabled public String AchievedType {get;set;}
    }


}