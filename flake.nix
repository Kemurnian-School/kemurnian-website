{
  description = "Node.js + pnpm + vercel dev shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };
    in {
      devShells.${system}.default = pkgs.mkShell {
        packages = with pkgs; [
          nodejs
          nodePackages.pnpm
          nodePackages.vercel
        ];

        shellHook = ''
          echo "node  : $(node -v)"
          echo "pnpm  : $(pnpm -v)"
          echo "vercel: $(vercel --version)"
        '';
      };
    };
}

