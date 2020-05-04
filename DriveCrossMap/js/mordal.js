'use strict';
{
    const open = document.getElementById("open");
    const closed= document.getElementById("closed");
    const mordal = document.getElementById("mordal");
    const mask = document.getElementById("mask");

    open.addEventListener("click" , ()=>{
        mordal.classList.remove("hidden");
        mask.classList.remove("hidden");
    });

    closed.addEventListener("click" , ()=>{
        mordal.classList.add("hidden");
        mask.classList.add("hidden");
    });
    mask.addEventListener("click" , ()=>{
        mordal.classList.add("hidden");
        mask.classList.add("hidden");
    });
}