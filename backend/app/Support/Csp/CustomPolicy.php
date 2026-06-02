<?php

namespace App\Support\Csp;

use Spatie\Csp\Directive;
use Spatie\Csp\Policies\Basic;

class CustomPolicy extends Basic
{
    public function configure()
    {
        parent::configure();

        $this
            ->addDirective(Directive::SCRIPT, [
                'self',
                'unsafe-inline',
                'unsafe-eval',
                'https://js.stripe.com',
                'blob:',
            ])
            ->addDirective(Directive::STYLE, [
                'self',
                'unsafe-inline',
            ])
            ->addDirective(Directive::IMG, [
                '*',
                'data:',
                'blob:',
            ])
            ->addDirective(Directive::FONT, [
                'self',
                'data:',
            ])
            ->addDirective(Directive::CONNECT, [
                'self',
                'https://api.stripe.com',
            ])
            ->addDirective(Directive::FRAME, [
                'self',
                'https://js.stripe.com',
            ]);
    }
}
