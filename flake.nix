{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
    systems.url = "github:nix-systems/default";
  };

  outputs =
    {
      nixpkgs,
      systems,
      ...
    }:
    let
      inherit (nixpkgs) lib legacyPackages;
      allSystems = import systems;
      eachSystem = lib.genAttrs allSystems;
      eachPkgs = f: eachSystem (s: f legacyPackages.${s});
    in
    {
      devShells = eachPkgs (pkgs: {
        default = pkgs.mkShell {
          nativeBuildInputs = with pkgs; [
            nodejs
            corepack
          ];
        };
      });
    };
}
