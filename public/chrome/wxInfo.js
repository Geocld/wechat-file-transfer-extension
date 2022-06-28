function getWxInfo () {
  const loginDom = document.querySelector('.page-logined')
  let isLogin = false
  if(loginDom) {
    isLogin = true
  }
  
  return {
    isLogin: isLogin
  }
}


getWxInfo();