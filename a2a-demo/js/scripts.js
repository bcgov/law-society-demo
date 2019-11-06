var keycloak = Keycloak({
  url: "https://sso-dev.pathfinder.gov.bc.ca/auth",
  realm: "vlv1c2en",
  clientId: "law-society-demo"
});
keycloak
  .init({ onLoad: "login-required" })
  .success(function(authenticated) {
    // alert(authenticated ? "authenticated" : "not authenticated");
    keycloak.loadUserInfo().success(function(userInfo) {
      console.log("UserInfo: ", userInfo)
      document.getElementById("user-info").innerHTML = userInfo.email;
      document.body.style.display = "";
    });
  })
  .error(function() {
    alert("failed to initialize");
  });

function logout() {
  keycloak.logout();
}
