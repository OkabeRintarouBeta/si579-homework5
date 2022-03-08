/**
 * Returns a list of objects grouped by some property. For example:
 * groupBy([{name: 'Steve', team:'blue'}, {name: 'Jack', team: 'red'}, {name: 'Carol', team: 'blue'}], 'team')
 *
 * returns:
 * { 'blue': [{name: 'Steve', team: 'blue'}, {name: 'Carol', team: 'blue'}],
 *    'red': [{name: 'Jack', team: 'red'}]
 * }
 *
 * @param {any[]} objects: An array of objects
 * @param {string|Function} property: A property to group objects by
 * @returns  An object where the keys representing group names and the values are the items in objects that are in that group
 */
 function groupBy(objects, property) {
    // If property is not a function, convert it to a function that accepts one argument (an object) and returns that object's
    // value for property (obj[property])
    if(typeof property !== 'function') {
        const propName = property;
        property = (obj) => obj[propName];
    }

    const groupedObjects = new Map(); // Keys: group names, value: list of items in that group
    for(const object of objects) {
        const groupName = property(object);
        //Make sure that the group exists
        if(!groupedObjects.has(groupName)) {
            groupedObjects.set(groupName, []);
        }
        groupedObjects.get(groupName).push(object);
    }

    // Create an object with the results. Sort the keys so that they are in a sensible "order"
    const result = {};
    for(const key of Array.from(groupedObjects.keys()).sort()) {
        result[key] = groupedObjects.get(key);
    }
    return result;
}

// Initialize DOM elements that will be used.
const outputDescription = document.querySelector('#output_description');
const wordOutput = document.querySelector('#word_output');
const showRhymesButton = document.querySelector('#show_rhymes');
const showSynonymsButton = document.querySelector('#show_synonyms');
const wordInput = document.querySelector('#word_input');
const savedWords = document.querySelector('#saved_words');


wordInput.value='';

// Stores saved words.
const savedWordsArray = [];

/**
 * Makes a request to Datamuse and updates the page with the
 * results.
 * 
 * Use the getDatamuseRhymeUrl()/getDatamuseSimilarToUrl() functions to make
 * calling a given endpoint easier:
 * - RHYME: `datamuseRequest(getDatamuseRhymeUrl(), () => { <your callback> })
 * - SIMILAR TO: `datamuseRequest(getDatamuseRhymeUrl(), () => { <your callback> })
 *
 * @param {String} url
 *   The URL being fetched.
 * @param {Function} callback
 *   A function that updates the page.
 */
function datamuseRequest(url, callback) {
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            // This invokes the callback that updates the page.
            callback(data);
        }, (err) => {
            console.error(err);
        });
}

/**
 * Gets a URL to fetch rhymes from Datamuse
 *
 * @param {string} rel_rhy
 *   The word to be rhymed with.
 *
 * @returns {string}
 *   The Datamuse request URL.
 */
function getDatamuseRhymeUrl(rel_rhy) {
    return `https://api.datamuse.com/words?${(new URLSearchParams({'rel_rhy': wordInput.value})).toString()}`;
}

/**
 * Gets a URL to fetch 'similar to' from Datamuse.
 *
 * @param {string} ml
 *   The word to find similar words for.
 *
 * @returns {string}
 *   The Datamuse request URL.
 */
function getDatamuseSimilarToUrl(ml) {
    return `https://api.datamuse.com/words?${(new URLSearchParams({'ml': wordInput.value})).toString()}`;
}

/**
 * Add a word to the saved words array and update the #saved_words `<span>`.
 *
 * @param {string} word
 *   The word to add.
 */
function addToSavedWords(word) {
    // You'll need to finish this...
    savedWordsArray.push(word);
    savedWords.innerHTML=savedWordsArray.join(',');
}

// Add additional functions/callbacks here.
function addList(result_list){
    deleteLoading();
    if (result_list.length==0){
        const noresult=document.createElement("h3");
        noresult.innerHTML='(no results)';
        wordOutput.append(noresult);
    }
    const grouped_list=groupBy(result_list,'numSyllables');
    for(const [key,value] of Object.entries(grouped_list)){
        // console.log(key,value);
        const syllabusnum=document.createElement('h3');
        syllabusnum.innerHTML=`Syllables: ${key}`;
        wordOutput.append(syllabusnum);
        const ul=document.createElement('ul');
        wordOutput.append(ul);
        for(const item of value){
            let li=document.createElement('li');
            li.innerHTML=item['word'];
            ul.appendChild(li);
            let btn=document.createElement('button');
            btn.innerHTML='(Save)';
            btn.style.backgroundColor='green';
            btn.setAttribute('id','saveButton');
            li.appendChild(btn);
        }
    }
}

function addSimilarList(result_list){
    deleteLoading();
    if (result_list.length==0){
        const noresult=document.createElement("h3");
        noresult.innerHTML='(no results)';
        wordOutput.append(noresult);
    }
    
    const ul=document.createElement('ul');
    wordOutput.append(ul);
    for(const item of result_list){
        let li=document.createElement('li');
        li.innerHTML=item['word'];
        ul.appendChild(li);
        let btn=document.createElement('button');
        btn.innerHTML='(Save)';
        btn.style.backgroundColor='green';
        btn.setAttribute('id','saveButton');
        li.appendChild(btn);
    }
}


function createLoading(){
    const ele=document.createElement('h3');
    ele.innerHTML='Loading...';
    wordOutput.append(ele);
    // console.log('loading created!');
}
function deleteLoading(){
    if(wordOutput.firstChild.innerHTML=='Loading...'){
        wordOutput.removeChild(wordOutput.firstChild);
        // console.log("loading deleted!");
    }
}


// Add event listeners here.
showRhymesButton.addEventListener("click",()=>{
    while(outputDescription.firstChild){
        outputDescription.removeChild(outputDescription.firstChild);
    }
    while (wordOutput.firstChild) {
        wordOutput.removeChild(wordOutput.firstChild);
    }
    let query=wordInput.value;
    if (query!=''){
        let url=getDatamuseRhymeUrl(query);
        // console.log(url);
        const rhymeswith=document.createElement('h2');
        rhymeswith.innerHTML=`Words that rhyme with ${query}`;
        outputDescription.appendChild(rhymeswith);
        createLoading();
        datamuseRequest(url,addList);
    }
    
})

wordInput.addEventListener("keydown",(e)=>{
    if (e.key=='Enter' && wordInput.value!=''){
        while(outputDescription.firstChild){
            outputDescription.removeChild(outputDescription.firstChild);
        }
        while (wordOutput.firstChild) {
            wordOutput.removeChild(wordOutput.firstChild);
        }
        let query=wordInput.value;
        let url=getDatamuseRhymeUrl(query);
        // console.log(url);
        const rhymeswith=document.createElement('h2');
        rhymeswith.innerHTML=`Words that rhyme with ${query}`;
        outputDescription.append(rhymeswith);
        createLoading();
        datamuseRequest(url,addList);
    }
})

showSynonymsButton.addEventListener('click',()=>{
    while(outputDescription.firstChild){
        outputDescription.removeChild(outputDescription.firstChild);
    }
    while (wordOutput.firstChild) {
        wordOutput.removeChild(wordOutput.firstChild);
    }
    let query=wordInput.value;
    if (query!=''){
        let url=getDatamuseSimilarToUrl(query);
        // console.log(url);
        const similarwith=document.createElement('h2');
        similarwith.innerHTML=`Words with a similar meaning to ${query}`;
        outputDescription.append(similarwith);
        createLoading();
        datamuseRequest(url,addSimilarList);
    }
})

wordOutput.addEventListener("click",(e)=>{
    if(e.target.id=='saveButton'){
        let tmp = e.target.parentNode.textContent;
        console.log(tmp);
        tmp=tmp.substring(0,tmp.length-6);
        addToSavedWords(tmp);
    }
})


