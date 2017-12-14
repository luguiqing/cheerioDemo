var http = require("https");
var cheerio = require("cheerio");
var fs = require('fs');
var iconv = require('iconv-lite');
var BufferHelp = require('bufferhelper');


function download(url, callback) {
	http.get(url, function(res) {
	var data = new BufferHelp();
	res.on('data', function (chunk) {
	    data.concat(chunk);
	});
	res.on("end", function() {
	    callback(decodeBuffer(data));
	});
	}).on("error", function() {
		callback(null);
	});
}

function readFile(path, cb) {
    var readstream = fs.createReadStream(path);
    var bf = new BufferHelp();
    readstream.on('data', function(chunk) {
        bf.concat(chunk);
    });
    readstream.on('end', function() {
        cb && cb(decodeBuffer(bf));
    });
}

function writeFile(path, str, cb) {
    var writestream = fs.createWriteStream(path);

    writestream.write(str);
    writestream.on('close', function() {
        cb && cb();
    });
}
function decodeBuffer(bf, encoding) {
    var val = iconv.decode(bf.toBuffer(), encoding || 'utf8');
    if (val.indexOf('�') != -1) {
        val = iconv.decode(bf.toBuffer(), 'gbk');
    }
    return val;
}

var url = "https://ab.alipay.com/i/yinhang.htm";

download(url, function(data) {
	if (data) {
		//console.log(data);
		var $ = cheerio.load(data, {decodeEntities: false});
		//console.log( typeof $('span.icon'))
		var spanList = $('span.icon');
		var arr = [];
		for(let item in spanList){
			//console.log(spanList[item].attribs.title)
			if(spanList[item].attribs && spanList[item].attribs.title){
				arr.push(spanList[item].attribs)
			}
			
		}
		var target = {};
		arr.forEach(function(item){
			var key = item.class.split(' ')[1];
			if(!target[key]){
				target[key] = item.title
			}
		})
		writeFile('cache.json', JSON.stringify(target))
	}
	else console.log("error");
});