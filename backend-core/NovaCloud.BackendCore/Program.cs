using Amazon;
using Amazon.CognitoIdentityProvider;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using NovaCloud.BackendCore.Services;

DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

var awsRegion = builder.Configuration["AWS:Region"];
var userPoolId = builder.Configuration["AWS:UserPoolId"];
var clientId = builder.Configuration["AWS:ClientId"];

if (string.IsNullOrWhiteSpace(awsRegion) ||
    string.IsNullOrWhiteSpace(userPoolId) ||
    string.IsNullOrWhiteSpace(clientId))
{
    throw new InvalidOperationException(
        "Missing AWS configuration. Ensure AWS__Region, AWS__UserPoolId, and AWS__ClientId are set.");
}

var regionEndpoint = RegionEndpoint.GetBySystemName(awsRegion);

// Services
builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddSingleton<IAmazonCognitoIdentityProvider>(_ =>
    new AmazonCognitoIdentityProviderClient(regionEndpoint));
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://cognito-idp.{awsRegion}.amazonaws.com/{userPoolId}";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = $"https://cognito-idp.{awsRegion}.amazonaws.com/{userPoolId}",
            ValidateAudience = true,
            ValidAudience = clientId,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true
        };
    });
    
builder.Services.AddAuthorization();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// Pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseCors("FrontendDev");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();