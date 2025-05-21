import { LightningElement, track, api  } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
 import inserttargetRecordsRecords from '@salesforce/apex/UploadTargetManagementCSVFileController.inserttargetRecordsRecords';
 import insertAchievedRecsFunction from '@salesforce/apex/UploadTargetManagementCSVFileController.insertAchievedRecsFunction';
// import getTemplateApiNames from '@salesforce/apex/ProspectingVehicleRelatedListController.getTemplateApiNames';
// import FORM_FACTOR from '@salesforce/client/formFactor';
// import DesktopView from './UploadTargetManagementCSVFile.html';
// import MobileView from './uploadCsvOnLeadMobileView.html';
export default class UploadTargetManagementCSVFile extends NavigationMixin(LightningElement) {
    @api recordId;
    @track showLoadingSpinner = false;
    @track importButtonDisable = true;
    @track disabledButton = false;
    @track YtdTarget = false;
    @track ytdAchieved=false;
    MAX_FILE_SIZE = 2000000; //Max file size 2.0 MB
    filename;

    // render(){
    //     return FORM_FACTOR==='Large' ? DesktopView : MobileView;
    // }
 
    importcsv(event){
        if (event.target.files.length > 0) {
            let filesUploaded = event.target.files;
            this.filename = event.target.files[0].name;
            this.disabledButton = true;
            console.log(this.filename);
            if (filesUploaded.size > this.MAX_FILE_SIZE) {
                this.filename = 'File Size is to long to process';
                this.importButtonDisable = true;
            } else{
                this.importButtonDisable = false;
                this.readFiles();
            }
            
        }
    }

    readFiles(){
        [...this.template.querySelector('lightning-input').files].forEach(async file => {
            try {
                const result = await this.load(file);
                // Process the CSV here
                this.showLoadingSpinner = false;
                console.log(result);
               // this.processData(result);
                this.csvJSON(result);
            } catch(e) {
                // handle file load exception
                console.log('exception....');
            }
        });
    }
    
    async load(file) {
        return new Promise((resolve, reject) => {
        this.showLoadingSpinner = true;
            const reader = new FileReader();
            // Read file into memory as UTF-8      
            //reader.readAsText(file);
            reader.onload = function() {
                resolve(reader.result);
            };
            reader.onerror = function() {
                reject(reader.error);
            };
            reader.readAsText(file);
        });
    }

     
    //process CSV input to JSON
    csvJSON(csv){
        this.data = [];
        let lines=csv.split(/\r\n|\n/);
        let result = [];
        let headers=lines[0].split(",");
        console.log('headers..'+JSON.stringify(headers));
        for(let i=1;i<lines.length-1;i++){
            let obj = {};
            let currentline=lines[i].split(",");
            for(let j=0;j<headers.length;j++){
                obj[headers[j]] = currentline[j];
            }
            result.push(obj);
        }
        console.log('result..'+JSON.stringify(result));
        //return result; //JavaScript object
        this.data = result;
        console.log('this.data  '+JSON.stringify(this.data));
    }

    insertRecordsFunction(){
        this.spinnerOn = true;
        inserttargetRecordsRecords({targetLst: JSON.stringify(this.data)})
        .then(result => {
            console.log('Result :: '+result);
            this.spinnerOn = false;
            this.cancel();
        })
        .catch(error => {
            console.log('Error:::' + JSON.stringify(error));
            console.log('Error:::' ,error);
            this.showToastMessage('Error',error.body.fieldErrors,'error');
        });
    }

    insertAchievedRecordsFunction(){
        console.log('achieved function called');
        this.spinnerOn = true;
        insertAchievedRecsFunction({targetLst: JSON.stringify(this.data)})
        .then(result =>{
            console.log('Result:: '+result);
            this.spinnerOn = false;
            this.cancel();
        })
        .catch(error => {
            console.log('Error:::' + JSON.stringify(error));
            console.log('Error:::' ,error);
            this.showToastMessage('Error',error.body.fieldErrors,'error');
        });
        
    }

    // @track dataTemplate = [];
    // connectedCallback(){
    //     this.getTemplateApiNamesFunction();
    // }

    // getTemplateApiNamesFunction() {
    //     this.dataTemplate=[];
    //     getTemplateApiNames()
    //     .then(result => {
    //         this.dataTemplate =JSON.parse(result);
    //     })
    //     .catch(error => {
    //         console.log('error getTemplateApiNames ::: ' +JSON.stringify(error));
    //         console.log('error getTemplateApiNames message ::: ' +JSON.stringify(error.message));
    //     });
    // }

    // this method validates the dataTemplate and creates the csv file to download
    // downloadCSVFile(){   
    //     let rowEnd = '\n';
    //     let csvString = '';
    //     let rowData = new Set();
    //     rowData = this.dataTemplate;
    //     console.log('Row Data Array From :: ',JSON.stringify(rowData));
    //     // splitting using ','
    //     csvString += rowData.join(',');
    //     csvString += rowEnd;
    //     console.log('CSV String :: '+csvString);
    //     // Creating anchor element to download
    //     let downloadElement = document.createElement('a');
    //     // This  encodeURI encodes special characters, except: , / ? : @ & = + $ # (Use encodeURIComponent() to encode these characters).
    //     downloadElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvString);
    //     downloadElement.target = '_self';
    //     // CSV File Name
    //     downloadElement.download = 'Upload CSV Template.csv';
    //     // below statement is required if you are using firefox browser
    //     document.body.appendChild(downloadElement);
    //     // click() Javascript function to download CSV file
    //     downloadElement.click(); 
    // }

    cancel(){
        console.log('Cancel :::: ');
       // window.location.reload();
        this.navigateToOrderListView();
        this.filename='';
        this.disabledButton= false;
        this.importButtonDisable= true; 
        
    }

    navigateToOrderListView() {
        // location.reload();
         this[NavigationMixin.Navigate]({
         type: 'standard__objectPage',
         attributes: {
         objectApiName: 'Target_Managment__c',
         actionName: 'list'
         }
         });
     }

    //SHOW TOAST EVENT
    showToastMessage(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }
    handleYtdTargetSelect(event){
        var value=event.target.value;
        if(value=='Target'){
            this.YtdTarget = true;
            this.ytdAchieved=false;
        }
        if(value=='Achieved'){
            this.ytdAchieved=true;
            this.YtdTarget=false;
        }
        console.log('Value ::' ,value);
    }
    handleYtdAchievedSelect(){
        
        console.log('Value of achieved::' ,this.YtdTarget);
    }

    importAchievedcsv(){
        console.log('importAchievedcsv called');
    }
}