{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        packages = with pkgs; [
					just
          nodejs
          nodePackages.pnpm
          nodePackages.vercel
          supabase-cli
          minio-client
          postgresql
          openssl
					docker-compose
        ];

        shellHook = ''
          echo "node  : $(node -v)"
          echo "pnpm  : $(pnpm -v)"
          echo "vercel: $(vercel --version)"
        '';
      };
    };
}
