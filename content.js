var isFetching = false;
var hasResult = false;
var previousSelectedText;
var currentSelectedText;
var contextUrl = window.location.host + window.location.pathname;

async function getExplaination(txt){
    const response = await fetch('https://apifreellm.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: "(context " + contextUrl + ", no using asterisk, no follow-up questions, organize in html elements no headings, do not wrap the code in ```html or ``` blocks, no yapping, respond directly to the user’s request) explain this in a very short details: " + txt })
    });
    const data = await response.json();

    return data.status === 'success' ? data.response : false;
}

const body = document.body;
const bgColor = window.getComputedStyle(body).backgroundColor;
const color = window.getComputedStyle(body).color;

const style = document.createElement('style');
style.textContent = `
    #contextMenu > div:nth-child(1) {
       
    }
    #contextMenu {
        font-size: 15px !important;
    }
`;

document.head.appendChild(style);

document.body.insertAdjacentHTML("afterbegin", `
    <div id="contextMenu" style="position:absolute;max-width:350px; display:none; list-style:none; background-color:#fff;color:#000; border:1px solid #ccc;z-index:1000000000000;border-radius:4px;">
        <div style="padding:10px 20px;display:flex;justify-content:space-between;column-gap:20px;align-items:center;"><span class="exbtn">Explain with AI</span>
        <span class="retry-icon" style="display:none;">
        <svg xmlns="http://www.w3.org/2000/svg" width="15px" height="15px" viewBox="0 0 16 16">
            <path fill="rgba(0,0,0,0.5)" d="M14.9547098,7.98576084 L15.0711,7.99552 C15.6179,8.07328 15.9981,8.57957 15.9204,9.12636 C15.6826,10.7983 14.9218,12.3522 13.747,13.5654 C12.5721,14.7785 11.0435,15.5888 9.37999,15.8801 C7.7165,16.1714 6.00349,15.9288 4.48631,15.187 C3.77335,14.8385 3.12082,14.3881 2.5472,13.8537 L1.70711,14.6938 C1.07714,15.3238 3.55271368e-15,14.8776 3.55271368e-15,13.9867 L3.55271368e-15,9.99998 L3.98673,9.99998 C4.87763,9.99998 5.3238,11.0771 4.69383,11.7071 L3.9626,12.4383 C4.38006,12.8181 4.85153,13.1394 5.36475,13.3903 C6.50264,13.9466 7.78739,14.1285 9.03501,13.9101 C10.2826,13.6916 11.4291,13.0839 12.3102,12.174 C13.1914,11.2641 13.762,10.0988 13.9403,8.84476 C14.0181,8.29798 14.5244,7.91776 15.0711,7.99552 L14.9547098,7.98576084 Z M11.5137,0.812976 C12.2279,1.16215 12.8814,1.61349 13.4558,2.14905 L14.2929,1.31193 C14.9229,0.681961 16,1.12813 16,2.01904 L16,6.00001 L12.019,6.00001 C11.1281,6.00001 10.6819,4.92287 11.3119,4.29291 L12.0404,3.56441 C11.6222,3.18346 11.1497,2.86125 10.6353,2.60973 C9.49736,2.05342 8.21261,1.87146 6.96499,2.08994 C5.71737,2.30841 4.57089,2.91611 3.68976,3.82599 C2.80862,4.73586 2.23802,5.90125 2.05969,7.15524 C1.98193,7.70202 1.47564,8.08224 0.928858,8.00448 C0.382075,7.92672 0.00185585,7.42043 0.0796146,6.87364 C0.31739,5.20166 1.07818,3.64782 2.25303,2.43465 C3.42788,1.22148 4.95652,0.411217 6.62001,0.119916 C8.2835,-0.171384 9.99651,0.0712178 11.5137,0.812976 Z"/>
        </svg>
        </span></div>
    </div>
`)

const contextMenu = document.getElementById('contextMenu');
var txt;

document.addEventListener("click", function(){
    const selection = window.getSelection();
    
    const selectedText = window.getSelection().toString();
    if (selectedText) {
        txt = selectedText;
        if (hasResult && currentSelectedText != previousSelectedText) {
            contextMenu.querySelector(".ex-con").remove();
            contextMenu.querySelector("div span.exbtn").textContent = "Explain with AI";
            contextMenu.querySelector("span.retry-icon").style.display = "none";
        }
    } else {
        txt = undefined;
    }

    contextMenu.style.display = 'none';
})

contextMenu.querySelector("div:nth-child(1)").addEventListener("click",async function(event){
    event.stopImmediatePropagation();
    if (!isFetching) {
        contextMenu.querySelector("div span.exbtn").textContent = "Please wait...";
        contextMenu.querySelector("span.retry-icon").style.display = "none";
        isFetching = true;
        let result = await getExplaination(txt);
        if (!result) {
            isFetching = false;
            contextMenu.querySelector("span.retry-icon").style.display = "block";
            contextMenu.querySelector("div span.exbtn").textContent = "An error occured"
            return 
        }
        hasResult = true;
        previousSelectedText = txt;
        isFetching = false;
        contextMenu.querySelector("div span.exbtn").textContent = "Result:";
        let explaination = result;
        if (!contextMenu.querySelectorAll(".ex-con").length > 0) {
            let con = `<div class="ex-con" style="padding:5px 20px 10px;border-top:1px solid #ccc;max-height:350px;overflow:auto;">
                ${explaination}
            </div>`;
            contextMenu.insertAdjacentHTML("beforeend", con);
        } else {
            contextMenu.querySelector(".ex-con").innerHTML = explaination;
        }
    }
})

function isAllSpaces(str) {
  return str.trim().length === 0;
}

this.document.addEventListener('contextmenu', function(e) {
    if (txt != undefined && !isAllSpaces(txt)) {
        e.preventDefault(); 
        contextMenu.style.top = `${e.pageY}px`;
        contextMenu.style.left = `${e.pageX}px`;
        contextMenu.style.display = 'block';
    } else {
        contextMenu.style.display = 'none';
    }
});
