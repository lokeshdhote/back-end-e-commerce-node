var navText = document.querySelector(".nav-text").innerHTML
var splitNavtext = navText.split("")
var clutter =` `
splitNavtext.forEach((e)=>{
    clutter+=`<span>${e}</span>`

})
navText=clutter
document.querySelector(".nav-text").innerHTML = navText;

 var tl1 = gsap.timeline()

tl1
.from(".nav-text span ",{
    stagger:0.1,
    x:-200,
    opacity:0,
    delay:0.1
})

.from(".nav-part2 a",{
    stagger:0.25,
    opacity:0,
})

var mouse = document.querySelector(".mouse")

document.querySelector(".Text-part").addEventListener("mousemove",function(e){
    gsap.to(".mouse",{
      top:e.y-55+"px",
      left:e.x-55+"px",
      transform: "scale(1)",
      display: "block",
      mixBlendMode:"difference"
    })
  })
  document.querySelector(".Text-part").addEventListener("mouseenter", function(){
    gsap.to(".mouse",{
      transform: "scale(1)",
    })
  })
  document.querySelector(".Text-part").addEventListener("mouseleave", function(){
    gsap.to(".mouse",{
      transform: "scale(0)",
  
  
    })
  })

//   document.querySelector('.button').addEventListener('click', function() {
           
//     var downloadLink = document.querySelector('#downloadLink');

  
//     var fileURL = 'file.png'; 

//     downloadLink.setAttribute('href', fileURL);

//     downloadLink.click();
// });