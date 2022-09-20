import type { IBaseViewOptions } from "../IBaseViewOptions";
import { RedirectRequestResult } from "../results/RedirectRequestResult";
import { RenderRequestResult } from "../results/RenderRequestResult";

export abstract class RequestHandler<TViewOptions extends IBaseViewOptions> {
    protected render(view: string, options: TViewOptions): RenderRequestResult<TViewOptions> {
        return new RenderRequestResult<TViewOptions>(view, options);
    }

    protected redirect(url: string): RedirectRequestResult {
        return new RedirectRequestResult(url);
    }
}