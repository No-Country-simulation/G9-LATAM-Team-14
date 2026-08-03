import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementsChart } from './movements-chart';

describe('MovementsChart', () => {
  let component: MovementsChart;
  let fixture: ComponentFixture<MovementsChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovementsChart],
    }).compileComponents();

    fixture = TestBed.createComponent(MovementsChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
