import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Analyzer } from 'src/app/report/analyzer';
import { LogsService } from 'src/app/logs/logs.service';
import { LogSummary } from 'src/app/logs/log-summary';

@Component({
  selector: 'report-details',
  templateUrl: './report-details.component.html',
  styleUrls: ['./report-details.component.scss']
})
export class ReportDetailsComponent implements OnInit {
  logId: string|null;
  playerName: string|null;
  encounterId: number;
  summary: LogSummary;

  analysis: any;

  constructor(private activatedRoute: ActivatedRoute,
              private logs: LogsService) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(
      switchMap((params) => {
        this.logId = params.get('logId') || '';

        if (params.has('encounterId')) {
          this.encounterId = parseInt(params.get('encounterId') || '', 10);
        }

        if (params.has('player')) {
          this.playerName = params.get('player');
        }

        return this.logs.getSummary(this.logId);
      }),
      switchMap((summary: LogSummary) => {
        this.summary = summary;

        if (this.playerName && this.encounterId) {
          return this.logs.getEvents(summary, this.playerName, this.encounterId);
        } else {
          return of([[], []]);
        }
      })
    ).subscribe(([casts, damage]) => {
      this.analysis = Analyzer.run(casts, damage);
    });
  }
}