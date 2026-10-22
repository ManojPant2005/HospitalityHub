FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY HospitalityHub.Api.Sqlite.csproj ./
RUN dotnet restore HospitalityHub.Api.Sqlite.csproj

COPY . .
RUN dotnet publish HospitalityHub.Api.Sqlite.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "HospitalityHub.Api.Sqlite.dll"]
