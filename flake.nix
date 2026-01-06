{
  description = "Kemurnian Website Development Shell";

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
          supabase-cli
          minio-client
          postgresql
          prisma-engines
          nodePackages.prisma
          openssl
        ];

        shellHook = ''
          echo "node  : $(node -v)"
          echo "pnpm  : $(pnpm -v)"
          echo "vercel: $(vercel --version)"
          
          # Prisma Setup for NixOS
          export PRISMA_SCHEMA_ENGINE_BINARY="${pkgs.prisma-engines}/bin/schema-engine"
          export PRISMA_QUERY_ENGINE_BINARY="${pkgs.prisma-engines}/bin/query-engine"
          export PRISMA_FMT_BINARY="${pkgs.prisma-engines}/bin/prisma-fmt"
          export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
        '';
      };
    };
}
