let signBitDiv;
let exponentBitsDiv;
let mantissaBitsDiv;

let signOutput;
let exponentOutput;
let mantissaOutput;
let resultOutput;

let exponent;
let mantissa;

let isSubnormal;
let isInfinite;

let sign;
let exponentBits;
let mantissaBits;
let bias;


//------------------------------------------------------------------------------
class DecomposedNumber
{
    #positions = {};
    #lsd = 0;
    #msd = 0;
    
    constructor()
    {

    };

    multiplyBy(coeffecient)
    {
        for(let position = this.#msd; position >= this.#lsd; position--)
        {
            let result = this.#positions[position] * floor(coeffecient);
            let operatingPosition = position;
            while(result >= 10)
            {

            }
        }
    };

    get value()
    {
        let numberString = "";

        if(this.#msd < -1) // Pad the number with zeroes if needed
        {
            numberString += ".";
            for(let position = -1; position > this.#msd; position--)
            {
                numberString += "0";
            }
        }

        for(let position = this.#msd; position >= this.#lsd; position--)
        {
            if(position == -1)
            {
                numberString += ".";
            }

            if(this.#positions[position] !== undefined)
            {
                numberString += toString(this.#positions[position]);
            }
            else
            {
                numberString += "0";
            }
        }
        
        return numberString;
    };
}


//------------------------------------------------------------------------------
function initialize()
{
    exponent = 0;
    mantissa = 0;

    isSubnormal = false;
    isInfinite = false;
    
    sign = false;
    exponentBits = [];
    mantissaBits = [];
    bias = 127;
    
    signBitDiv = document.getElementById("sign-bit");
    exponentBitsDiv = document.getElementById("exponent-bits");
    mantissaBitsDiv = document.getElementById("mantissa-bits");
    
    signOutput = document.getElementById("sign-output");
    exponentOutput = document.getElementById("exponent-output");
    mantissaOutput = document.getElementById("mantissa-output");
    resultOutput = document.getElementById("result-output");
    
    
    const signBitElem = document.createElement("span");
    signBitElem.innerText = "0";
    signBitElem.className = "sign bit";
    signBitElem.setAttribute("onclick", `switchSignBit()`);
    signBitElem.id="sign-bit-span";
    signBitDiv.appendChild(signBitElem);
    
    for(let i = 0; i < 8; i++)
        addExponentBit();
    
    for(let i = 0; i < 23; i++)
        addMantissaBit();
    
    updateExponent();
    updateMantissa();

    document.getElementById("intro-screen").remove();
}


function addExponentBit()
{
    const newExponentElem = document.createElement("span");
    newExponentElem.innerText = "0";
    newExponentElem.className = "exponent bit";
    newExponentElem.setAttribute("onclick", `switchExponentBit(${exponentBits.length})`);
    newExponentElem.id=`exponent-bit-${exponentBits.length}`;
    exponentBitsDiv.appendChild(newExponentElem);
    exponentBits.push(false);
    updateExponent();
}


function removeExponentBit()
{
    if(exponentBits.length < 2)
        return;

    const exponents = exponentBitsDiv.children;
    exponents[exponents["length"] - 1].remove();
    exponentBits.pop();
    updateExponent();
}


function addMantissaBit()
{
    const newMantissaElem = document.createElement("span");
    newMantissaElem.innerText = "0";
    newMantissaElem.className = "mantissa bit";
    newMantissaElem.setAttribute("onclick", `switchMantissaBit(${mantissaBits.length})`);
    newMantissaElem.id=`mantissa-bit-${mantissaBits.length}`;
    mantissaBitsDiv.appendChild(newMantissaElem);
    mantissaBits.push(false);
    updateMantissa();
}


function removeMantissaBit()
{
    if(mantissaBits.length < 2)
        return;
    
    const mantissas = mantissaBitsDiv.children;
    mantissas[mantissas["length"] - 1].remove();
    mantissaBits.pop();
    updateMantissa();
}


function switchSignBit()
{
    sign = !sign;
    document.getElementById("sign-bit-span").innerText = sign ? 1 : 0;
    signOutput.innerText = sign ? "-" : "";
    updateTotal();
}

            
function switchExponentBit(bit)
{
    if(typeof bit !== "number")
        return;
    
    if(bit < 0 || bit >= exponentBits.length)
        return;
    
    exponentBits[bit] = !exponentBits[bit];
    updateExponentBit(bit);
    updateExponent();
}


function updateExponentBit(bit)
{
    if(typeof bit !== "number")
        return;
    
    if(bit < 0 || bit >= exponentBits.length)
        return;

    document.getElementById(`exponent-bit-${bit}`).innerText = exponentBits[bit] ? "1" : "0";
}


function setBias(newBias)
{
    bias = newBias;
    updateExponent();
}


function updateExponent()
{
    exponent = 0;
    isSubnormal = true;
    isInfinite = true;
    
    for(let bit = 0; bit < exponentBits.length; bit++)
    {
        const value = exponentBits[bit];
        
        if(isSubnormal && value)
            isSubnormal = false;    
        
        if(isInfinite && !value)
            isInfinite = false;    
            
        exponent *= 2;
        exponent += exponentBits[bit] ? 1 : 0;
    }    
    
    exponent -= bias;
    
    if(isSubnormal)
        exponent += 1;    
    
    if(isInfinite)
        exponent = Infinity;

    updateExponentOutput();
    updateMantissa();
}


function updateExponentOutput()
{
    exponentOutput.innerText = exponent;
    updateTotal();
}
    
    
function switchMantissaBit(bit)
{
    if(typeof bit !== "number")
        return;
    
    if(bit < 0 || bit >= mantissaBits.length)
        return;
    
    mantissaBits[bit] = !mantissaBits[bit];
    updateMantissaBit(bit);
    updateMantissa();
}


function updateMantissaBit(bit)
{
    if(typeof bit !== "number")
        return;
    
    if(bit < 0 || bit >= mantissaBits.length)
        return;

    document.getElementById(`mantissa-bit-${bit}`).innerText = mantissaBits[bit] ? "1" : "0";
}


function updateMantissa()
{
    mantissa = 0;
    for(let bit = mantissaBits.length - 1; bit >= 0; bit--)
    {
        mantissa += mantissaBits[bit] ? 1 : 0;
        mantissa /= 2;
    }
    
    if(isInfinite)
    {
        if(mantissa != 0)
            mantissa = NaN;
    }
    else if(!isSubnormal)
        mantissa += 1;

    updateMantissaOutput();
}


function updateMantissaOutput()
{
    mantissaOutput.innerText = mantissa;
    updateTotal();
}


function updateTotal()
{
    let result = (sign ? -1 : 1) * mantissa * Math.pow(2, exponent)
    if(isInfinite && mantissa == 0)
        result = (sign ? -1 : 1) * Infinity;
    resultOutput.innerText = result.toString();
}