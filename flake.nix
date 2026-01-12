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
        NODE_TLS_REJECT_UNAUTHORIZED = "0";
				NODE_OPTIONS = "--tls-cipher-list=DEFAULT@SECLEVEL=0";
        packages = with pkgs; [
          nodejs
          nodePackages.pnpm
          nodePackages.vercel
          supabase-cli
          minio-client
          postgresql
          openssl
        ];

        shellHook = ''
          echo "node  : $(node -v)"
          echo "pnpm  : $(pnpm -v)"
          echo "vercel: $(vercel --version)"
        '';
      };
    };
}
