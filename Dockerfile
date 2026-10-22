FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY HospitalityHub.Api.Sqlite/HospitalityHub.Api.Sqlite.csproj HospitalityHub.Api.Sqlite/
RUN dotnet restore HospitalityHub.Api.Sqlite/HospitalityHub.Api.Sqlite.csproj

COPY HospitalityHub.Api.Sqlite/ HospitalityHub.Api.Sqlite/
WORKDIR /src/HospitalityHub.Api.Sqlite
RUN dotnet publish HospitalityHub.Api.Sqlite.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "dotnet HospitalityHub.Api.Sqlite.dll --urls http://0.0.0.0:${PORT:-8080}"]
