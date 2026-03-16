{
  description = "Shamua - Bible reference indexer CLI";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        shamua = pkgs.buildNpmPackage {
          pname = "shamua";
          version = "0.1.0";
          src = ./.;

          npmDepsHash = "sha256-kz2EBfI0qo3ozRrFBBGzXb0uAnuctn+fg114wD79hl0=";

          nativeBuildInputs = with pkgs; [
            typescript
          ];

          buildPhase = ''
            npm run build
          '';

          installPhase = ''
            mkdir -p $out/bin $out/lib
            cp -r dist/* $out/lib/
            cp -r node_modules $out/lib/

            cat > $out/bin/shamua <<EOF
            #!${pkgs.bash}/bin/bash
            exec ${pkgs.nodejs}/bin/node $out/lib/index.js "\$@"
            EOF
            chmod +x $out/bin/shamua
          '';
        };
      in
      {
        packages = {
          default = shamua;
          shamua = shamua;
        };

        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_22
            nodePackages.npm
            typescript
            nodePackages.typescript-language-server
            nodePackages.ts-node
          ];

          shellHook = ''
            echo "Shamua development environment"
            echo "Run 'npm install' to install dependencies"
            echo "Run 'npm run build' to build"
            echo "Run 'npm run dev -- -i <input> -o <output>' to run"
          '';
        };
      }
    );
}
