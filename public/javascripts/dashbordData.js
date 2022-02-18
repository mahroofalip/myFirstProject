console.log('HJFKSDHFSKJDFHSDKFJSDNFJKSDFHNSDKJUFHSDJKFHSDKFHSDNKFSDNFJKSDNFJKS');
(async function () {
   //monthlysale
    const response1 = await fetch("/admin/salesOnThisMonth",)
	
  
    var MonthlySale =await response1.json()
    x=MonthlySale.toString();
    var lastThree = x.substring(x.length-3);
    var otherNumbers = x.substring(0,x.length-3);
    if(otherNumbers != '')
        lastThree = ',' + lastThree;
    var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  
    document.getElementById('mSale').innerHTML = ` <span style="font-size: 25px;">₹</span>`+res
    //yearlysale
    const response2 = await fetch("/admin/salesOnThisYear",)
    var yearlySale =await response2.json()
    x=yearlySale.toString();
    var lastThree = x.substring(x.length-3);
    var otherNumbers = x.substring(0,x.length-3);
    if(otherNumbers != '')
        lastThree = ',' + lastThree;
    var res2 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  
    document.getElementById('ySale').innerHTML = ` <span style="font-size: 25px;">₹</span>`+res2
    
    
  



    //total profit
    
    const response3 = await fetch("/admin/totalProfit",)
    
    var profit =await response3.json()
    x=profit.toString();
    var lastThree = x.substring(x.length-3);
    var otherNumbers = x.substring(0,x.length-3);
    if(otherNumbers != '')
        lastThree = ',' + lastThree;
    var res3 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  
    document.getElementById('totalprofit').innerHTML = '<span>₹</span>'+res3
 

   // toal products
   const response4 = await fetch("/admin/totalProducts",)
    let totalProandSoldPro=await response4.json()
   
   let totalProducts =totalProandSoldPro.totalProd
   let soldProducts=totalProandSoldPro.soldprod
   document.getElementById('totalProducts').innerHTML = totalProducts
   document.getElementById('soldProducts').innerHTML = soldProducts


   const response5 = await fetch("/admin/totalUsers",)

   let totalUsers=await response5.json()
   document.getElementById('usersCount').innerHTML = totalUsers
    
   

})();