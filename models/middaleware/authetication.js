const { validatetoken } = require("../services/authetication");

function checkforauthentication(token){
    return (req,res,next)=>{
        const tokencookievalue=req.cookies[token];
        if(!tokencookievalue){
           return  next();
        }
            try {
                const userplayload=validatetoken(tokencookievalue);//The contents of userpayload
                req.user=userplayload;
                //now route can acess req.user
                //{
   //_id: "6a23c270d6526dcb9dc8662c",
   //fullname: "John",
   //email: "john@gmail.com"  it is used when user use any routes
//                   }
                
            } catch (error) {
            console.log("Invalid token");
            }
           return next();
        }
    }

module.exports={
checkforauthentication,
}
