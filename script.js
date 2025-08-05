// Scripted by Muzammil Ahmed

document.getElementById("generate").onclick =function passwordgenerator(){

    const lcase=  "abcdefghijklmnopqrstuvwxyz";
    const Ucase =   "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numberchar = "0123456789";
    const symbolchar = "!@#$%^&*()_+=-/*-+~`|:?><";

    let chacterset = "";

    if(document.getElementById("includeLower").checked){
        chacterset += lcase;
    }

    if(document.getElementById("includeUpper").checked){
        chacterset += Ucase;
    }

    if(document.getElementById("includeNumbers").checked){
        chacterset += numberchar;
    }

    if(document.getElementById("includeSymbols").checked){
        chacterset += symbolchar;
    }

    if(chacterset == ""){
        alert("Please select at least one chactertype set");
    }

    const length = parseInt(document.getElementById("length").value)
        
        let result = "";
        for(let i = 0; i<=length; i++){
            const randomindex = Math.floor(Math.random() * chacterset.length);
            result += chacterset[randomindex];
        };
        
        document.getElementById("password").value = result;
};

document.getElementById("copy").onclick = function copied(){
    
    const copied = document.getElementById("password").value;
    
    navigator.clipboard.writeText(copied)
    .then( ()=> {
        console.log("Password copied to clipboard!");
    })
    .catch(()=>{
        console.log("Failed to copy");
    });
    

}

