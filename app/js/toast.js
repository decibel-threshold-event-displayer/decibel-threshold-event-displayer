export const toast = {
  show: (message) => {
    const toast = document.getElementById("toast");
    document.getElementById("toast-message").innerText =
      message ?? "An error occurred. Please try reloading the page.";
    // ignore warnings here. bootstrap is a global object created when importing the bootstrap js in index.html
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);
    toastBootstrap.show();
  },
};
