class Column{
  constructor(index,name,explanation){
    this.index = index;
    this.name = name;
    this.explanation = explanation;
  }
}
class Data{
  constructor(value,col,row){
    this.value = value;
    this.col = col;
    this.row = row;
  }
}
  class MetaData {
    constructor(title,created,level,datasource) {
      //meta data başlıkları doluyor
        this.title = title;
        this.created = created;
        this.level = level;
        this.datasource = datasource;
      //column verileri columns arrayin içine atmak için
        this.columns =[];
        this.data = [];
    }
    //column verileri columns arrayin içine atmak için method
    addColumn(columnIndex,columnName,columnExp) {
      this.columns.push(new Column(columnIndex,columnName,columnExp));
    }
    addData(rowIndex,dataList){
      for (let index = 0; index < dataList.length; index++) {
          var colIndex = index;
          this.data.push(new Data(dataList[index],colIndex,rowIndex))
      }
    }
    getColumnAllRows(name){
      let findingColumn = this.columns.find(e=>e.name === name);
      let myArray = this.data.filter(e=>e.col == findingColumn.index).map(e=>e.value);
      console.log(myArray)
    }

    getRowWithColumns(rowIndex,columnsName){
        let findingColumn =this.columns.filter(e => columnsName.includes(e.name)).map(e=>e.index);
        //let findingColumn =this.columns.filter(e => columnsName.name === e.name).map(e=>e.index);
        let myArray = this.data.filter(e=> e.row == rowIndex && findingColumn.includes(String(e.col))).map(e=>e.value);
        return myArray
    }
}

var veri = 10;
var sayac = 0;
let metaDataObj = new MetaData(); 
function calistir(){
  const dosya = document.getElementById('upload').addEventListener('click',()=>{
    Papa.parse(document.getElementById('uplodfile').files[0],
    {
      dowload:true,
      header:false,
      complete: function(results){
        getMetaData(results.data);
        getData(results.data);
        //metaDataObj.getColumnAllRows('uid');
        getJsonData(veri);
      },
    })
  })
}

function getMetaData(results){
  metaDataObj.title = results[0][0].split('#')[1];
  metaDataObj.created = results[1][0].split('#')[1];
  metaDataObj.level = results[2][0].split('#')[1];
  metaDataObj.datasource = results[3][0].split('#')[1];
  for(i = 4; i < results.length; i++){
    if(String(results[i][0]).includes('#')){
      var veri = String(results[i][0]).split(' ');
      var columnIndexData = veri[3];
      var columnNameData = veri[4].split('=')[0];
      var columnExpData = veri[4].split('=')[1];
      metaDataObj.addColumn(columnIndexData,columnNameData,columnExpData)
    }
  }
}

function nextPage(){
  veri += 10;
  getJsonData(veri);
}

function backPage(){
  if(veri - 10 > 0){
    veri -= 10;
  }
  getJsonData(veri);
}

function getData(results){
  var dataStart = metaDataObj.columns.length + 4 + 1;
  for (let index = dataStart; index < results.length; index++) {
    metaDataObj.addData(index-dataStart,results[index])
  }
}

async function getJsonData(data){
  var veri = [];
  //metaDataObj.columns.length
  for (let index = 0; index < 9; index++) { //data col kadar dönücek
    var objectName = metaDataObj.columns[index].name;
    veri.push(objectName)
  }

  var tableArray = [];
  for (let j = data - 10; j < Number(data); j++) { //data uzunluğu kadar dönücek
    var gelenData = metaDataObj.getRowWithColumns(j,veri);
    var obj = {};
    for (let i = 0; i < veri.length; i++) {
      
      var columnExp = metaDataObj.columns.filter(e=>e.name == veri[i]).map(e=>e.explanation);

      obj[columnExp] = gelenData[i];

      if (veri[i] == 'transcript') {
        var apiId = gelenData[i].split('.')[0];
        var apiExpand = gelenData[i].split('.')[1];
       await fetch(`https://rest.ensembl.org/lookup/id/${apiId}?expand=${apiExpand};content-type=application/json`)
          .then((response) => response.json())
          .then((data) => {
            obj['start'] = data.start;
            obj['end'] = data.end;
          });
      }
      
    }
    tableArray.push(obj);
    
  }
  tabloOlustur(tableArray);
  //return tableArray;
}

function tabloOlustur(result){
  var table = new Tabulator("#example-table", {
    layout:"fitColumns",      //fit columns to width of table
    responsiveLayout:"hide",  //hide columns that dont fit on the table
    addRowPos:"top",          //when adding a new row, add it to the top of the table
    history:true,             //allow undo and redo actions on the table
    paginationSize:10,      
    data:result, //assign data to table
    autoColumns:true, //create columns from data field names
    headerFilter:'input',
});
}
    