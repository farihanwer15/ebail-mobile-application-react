import { NgModule } from "@angular/core";
import { ShortNumberPipe } from './short-number.pipe';

@NgModule({
  declarations: [ShortNumberPipe],
  exports: [ShortNumberPipe]
})
export class PipesModule {}