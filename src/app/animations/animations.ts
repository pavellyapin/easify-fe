import {
  animate,
  query,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const routeAnimation = trigger('routeAnimation', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          opacity: 0,
        }),
      ],
      { optional: true },
    ),
    query(':enter', [animate('300ms ease-in', style({ opacity: 1 }))], {
      optional: true,
    }),
    query(':leave', [animate('300ms ease-out', style({ opacity: 0 }))], {
      optional: true,
    }),
  ]),
]);

export const easeIn = trigger('easeIn', [
  transition(':enter', [
    style({ opacity: 0 }), // Initial state
    animate('600ms ease-in', style({ opacity: 1 })), // Final state with ease-in
  ]),
  transition(':leave', [
    style({ opacity: 1 }), // Initial state
    animate('600ms ease-out', style({ opacity: 0 })), // Final state with ease-out
  ]),
]);

export const slideTransition = trigger('slideInOut', [
  state(
    'in',
    style({
      opacity: 1,
      transform: 'translateX(0)',
    }),
  ),
  state(
    'out',
    style({
      opacity: 0,
      transform: 'translateX(-100%)',
    }),
  ),
  transition('in => out', animate('300ms ease-in')),
  transition('out => in', animate('300ms ease-out')),
]);
