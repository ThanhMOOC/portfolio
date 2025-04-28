{ pkgs, ... }: {
  channel = "unstable";

  packages = [
    pkgs.nodejs_20
    pkgs.nodePackages.nodemon
  ];

  env = {};
  idx = {
    extensions = [
    ];

    previews = {
      enable = true;
      previews = {
      };
    };
    workspace = {
      onCreate = {
        npm-install = "npm install --prefix server";
      };
      onStart = {
        watch-backend = "nodemon server/app.js";
      };
    };
  };
}
