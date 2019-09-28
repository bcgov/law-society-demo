var keycloak = Keycloak({
  url: "https://secure-keycloak-devex-bcgov-dap-tools.pathfinder.gov.bc.ca/auth",
  realm: "vc-auth",
  clientId: "law-society-demo"
});
keycloak
  .init({ onLoad: "login-required" })
  .success(function(authenticated) {
    // alert(authenticated ? "authenticated" : "not authenticated");
    keycloak.loadUserInfo().success(function(userInfo) {
      document.getElementById("user-info").innerHTML = userInfo.name;
      document.body.style.display = "";
    });
  })
  .error(function() {
    alert("failed to initialize");
  });

function logout() {
  keycloak.logout();
}
