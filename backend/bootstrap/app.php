<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
    $middleware->statefulApi();
    $middleware->append(\App\Http\Middleware\SecurityHeaders::class);
    $middleware->validateCsrfTokens(except: [
        'api/webhooks/stripe',
    ]);
    $middleware->web(append: [
        HandleInertiaRequests::class,
    ]);
    $middleware->alias([
        'authMiddleware' => \App\Http\Middleware\AuthMiddleware::class,
    ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
            if ($request->is('api/*')) {
                return true;
            }

            return $request->expectsJson();
        });

        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*')) {
                $status = 500;
                $message = 'Internal Server Error';

                if ($e instanceof \Illuminate\Validation\ValidationException) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Validation Error',
                        'errors' => $e->errors()
                    ], 422);
                }

                if ($e instanceof \Illuminate\Session\TokenMismatchException) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'CSRF Token Mismatch. Please refresh the page.'
                    ], 419);
                }

                if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpException) {
                    $status = $e->getStatusCode();
                    $message = $e->getMessage();
                } elseif ($e instanceof \Illuminate\Auth\AuthenticationException) {
                    $status = 401;
                    $message = 'Unauthenticated';
                }

                return response()->json([
                    'status' => 'error',
                    'message' => config('app.debug') ? $e->getMessage() : $message,
                ], $status);
            }
        });
    })->create();
