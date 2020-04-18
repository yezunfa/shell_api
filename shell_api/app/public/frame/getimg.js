var request = require('request');
var fs = require('fs');
var css = fs.readFileSync('./css/main.css', 'UTF-8');

var imgs = css.match(/url\(..\/images\/(.+?)\.png\)/g);

function downloadAndSave(imgMatch) {
    let img_filename = imgMatch.replace('url\(..\/images/','').replace(')','');
    var img_src = 'http://huafa.jzbwlkj.com/admin/images/' + img_filename; //获取图片的url
    //采用request模块，向服务器发起一次请求，获取图片资源
    request.head(img_src,function(err,res,body){
        if(err){
            console.log(err);
        }
    });
    request(img_src).pipe(fs.createWriteStream('./images/'+ img_filename)); 
}
for(var i =0; i < imgs.length; i++ ) {
    downloadAndSave(imgs[i]);
}



  