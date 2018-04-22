
var fs = require('fs');
var jsonexport = require('jsonexport');
const yelp = require('yelp-fusion');

const apiKey = 'M1iTYUdjOK0_ROlRdtySb24MCojMwQfVsPsrwuGWvCN8EWCe52LYoRJgP3EkzinKjakR3J08jCd-85FYsa7N8zy5Adtyv0b__ILbxDsCv3pUJhOTubt-OhSJSGPaWnYx';
var searchRequest = {
    categories: 'dogwalkers',
    location: 'san francisco, ca',
    limit: 50,
    offset: 0
};
const client = yelp.client(apiKey);

// the category could be found on https://www.yelp.com/developers/documentation/v3/all_category_list
const categoriesToDownload = ['aerialfitness', 'aerialfitness'];
const cities = ['Los Angeles, ca','San Diego, ca','San Jose, ca'];

//use the params to store the permutation of categories and cities 
var params = [];
cities.forEach(city => {
    categoriesToDownload.forEach(cate => {
        console.log("pushing", city, cate);
        params.push({ city, cate });
    })
});


// the array to save the return json 
var toWrite = []; 

// restricted by yelp, we could only get 50 items each time, so we nee the offset to get the all data
async function getData(city, cate, offset){
    let newRequest = {};
    newRequest.categories = cate;
    newRequest.location = city;
    newRequest.limit = 50;
    newRequest.offset = offset;
    toWrite = [];
    
    const timesPromise = await client.search(newRequest);
    const times = timesPromise.jsonBody.total;
    timesPromise.jsonBody.businesses.forEach(element => {
        element.categories = newRequest.cate;
        const prettyJson = JSON.stringify(element, null, 4);
        toWrite.push(prettyJson);
    });


    console.log("this is time",times);
    for(var i = 1; i < times/50+1; i++){
        console.log("i is ",i,newRequest.categories, newRequest.location);
        newRequest.offset += 50;
        const timesP = await client.search(newRequest);
        timesP.jsonBody.businesses.forEach(element => {
            element.categories = newRequest.cate;
            const prettyJson = JSON.stringify(element, null, 4);
            toWrite.push(prettyJson);
        });
    }

    return new Promise(function (resolve, reject) {
        const cityname = newRequest.location.split(",")[0];
        const statename = newRequest.location.split(",")[1];
        console.log("I am writing", newRequest.location, newRequest.categories);
        const filename = 'data/' + newRequest.categories + '_'  + cityname+"_"+ statename+ '.json';
        fs.writeFile(filename, toWrite, function (err) {
            if (err) {
                reject(err)
                return console.log(err);
            }
            console.log("The file was saved!", filename);
            resolve(filename);
        });
    })

}

async function manager(params) {
    for(const param of params){
        await getData(param.city, param.cate, 0);
    }
}

manager(params);