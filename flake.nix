{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { self, nixpkgs }:
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
          supabase-cli
          python3
          python3Packages.pyftpdlib
          postgresql
          openssl
          docker-compose
        ];

        shellHook = ''
          echo "node  : $(node -v)"
          echo "pnpm  : $(pnpm -v)"

          mkdir -p public/tmp/ftp-static

          if ! pgrep -f pyftpdlib > /dev/null; then
            python3 -m pyftpdlib -d public/tmp/ftp-static -u dev -P dev -p 2121 -w &
            echo "ftp   : ftp://127.0.0.1:2121"
          fi
        '';
      };
    };
}
