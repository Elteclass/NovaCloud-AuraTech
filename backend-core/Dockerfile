# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY NovaCloud.BackendCore/NovaCloud.BackendCore.csproj NovaCloud.BackendCore/
RUN dotnet restore NovaCloud.BackendCore/NovaCloud.BackendCore.csproj

COPY . .
RUN dotnet publish NovaCloud.BackendCore/NovaCloud.BackendCore.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "NovaCloud.BackendCore.dll"]
