
let array=[
    {"Id":1, "ParentId":null, "Sort":0, "Name":"菜单1" },
    {"Id":2, "ParentId":1,    "Sort":0, "Name":"菜单1-1" },
    {"Id":3, "ParentId":1,    "Sort":0, "Name":"菜单1-2" },
    {"Id":4, "ParentId":2,    "Sort":2, "Name":"菜单1-1-2" },
    {"Id":5, "ParentId":2,    "Sort":1, "Name":"菜单1-1-1" },
    {"Id":6, "ParentId":null, "Sort":0, "Name":"菜单2" },
    {"Id":7, "ParentId":6,    "Sort":0, "Name":"菜单2-1" },
    {"Id":8, "ParentId":6,    "Sort":0, "Name":"菜单2-2" },
    {"Id":9, "ParentId":8,    "Sort":2, "Name":"菜单2-2-2" },
    {"Id":10, "ParentId":8,   "Sort":1, "Name":"菜单2-2-1" },
    {"Id":11, "ParentId":10,  "Sort":0, "Name":"菜单2-2-1-1" },
    {"Id":12, "ParentId":10,  "Sort":0, "Name":"菜单2-2-1-2" },
    {"Id":13, "ParentId":5,    "Sort":2, "Name":"菜单1-1-1-2" },
    {"Id":14, "ParentId":5,    "Sort":1, "Name":"菜单1-1-1-1" }
];

/*
    str = `<ul>
        <li>
            <span>菜单1</span>
            <ul>
                <li>菜单1-1</li>
                <li>菜单1-2</li>
            </lu>

        </li>
        <li>菜单2</li>
    </ul>`;
*/

function dieda(obj,arry){
    this.arr = arry;
    this.index=0;
    this.str='';
    while(this.index<arry.length){
        arry[this.index].ParentId !=null?this.str ='#'+arr[this.index].id:str='#'+arr[this.index].ParentId;
        this.print($(str));
        index++;
        dieda(obj,arry);
    }
}

dieda.prototype.print = function(obj){
    obj.append('<span>'+this.arr[this.index].name+'</span>'+'<ul id='+this.arr[this.index].id+'></ul>')
}

var a2t = new dieda()
