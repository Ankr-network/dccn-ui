import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { EffectSources } from './effect_sources';
var EffectsRunner = /** @class */ (function () {
    function EffectsRunner(effectSources, store) {
        this.effectSources = effectSources;
        this.store = store;
        this.effectsSubscription = null;
    }
    EffectsRunner.prototype.start = function () {
        if (!this.effectsSubscription) {
            this.effectsSubscription = this.effectSources
                .toActions()
                .subscribe(this.store);
        }
    };
    EffectsRunner.prototype.ngOnDestroy = function () {
        if (this.effectsSubscription) {
            this.effectsSubscription.unsubscribe();
            this.effectsSubscription = null;
        }
    };
    EffectsRunner.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    EffectsRunner.ctorParameters = function () { return [
        { type: EffectSources, },
        { type: Store, },
    ]; };
    return EffectsRunner;
}());
export { EffectsRunner };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0c19ydW5uZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9tb2R1bGVzL2VmZmVjdHMvc3JjL2VmZmVjdHNfcnVubmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQWEsTUFBTSxlQUFlLENBQUM7QUFDdEQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUdwQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7O0lBTS9DLHVCQUNVLGFBQTRCLEVBQzVCLEtBQWlCO1FBRGpCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLFVBQUssR0FBTCxLQUFLLENBQVk7bUNBSndCLElBQUk7S0FLbkQ7SUFFSiw2QkFBSyxHQUFMO1FBQ0UsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsYUFBYTtpQkFDMUMsU0FBUyxFQUFFO2lCQUNYLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDMUI7S0FDRjtJQUVELG1DQUFXLEdBQVg7UUFDRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1lBQzdCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO1NBQ2pDO0tBQ0Y7O2dCQXRCRixVQUFVOzs7O2dCQUZGLGFBQWE7Z0JBSGIsS0FBSzs7d0JBRGQ7O1NBT2EsYUFBYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUsIE9uRGVzdHJveSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU3RvcmUgfSBmcm9tICdAbmdyeC9zdG9yZSc7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgRWZmZWN0U291cmNlcyB9IGZyb20gJy4vZWZmZWN0X3NvdXJjZXMnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRWZmZWN0c1J1bm5lciBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgZWZmZWN0c1N1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uIHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBlZmZlY3RTb3VyY2VzOiBFZmZlY3RTb3VyY2VzLFxuICAgIHByaXZhdGUgc3RvcmU6IFN0b3JlPGFueT5cbiAgKSB7fVxuXG4gIHN0YXJ0KCkge1xuICAgIGlmICghdGhpcy5lZmZlY3RzU3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLmVmZmVjdHNTdWJzY3JpcHRpb24gPSB0aGlzLmVmZmVjdFNvdXJjZXNcbiAgICAgICAgLnRvQWN0aW9ucygpXG4gICAgICAgIC5zdWJzY3JpYmUodGhpcy5zdG9yZSk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuZWZmZWN0c1N1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5lZmZlY3RzU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICB0aGlzLmVmZmVjdHNTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIH1cbiAgfVxufVxuIl19