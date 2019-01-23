import { Component, OnInit } from '@angular/core';
import {liquidFillGaugeDefaultSettings, loadLiquidFillGauge} from './ankr-chart';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  constructor(private httpClient: HttpClient) {
  }
  dclists;
  ngOnInit() {
    this.renderChartIfExist();
    this.httpClient.get('/pp/v1/datacenters')
    // .subscribe(data => console.log(data));
    .subscribe(data => this.dclists = data);
  }

  renderChartIfExist() {
    if (document.getElementById('dashboard_cpu')) {
      this.renderChart();
    } else {
      window.setTimeout(() => {
        this.renderChartIfExist();
      }, 1000);
    }
  }

  renderChart() {
    // cpu
    const configCPU = liquidFillGaugeDefaultSettings();
    configCPU.circleThickness = 0.05;
    configCPU.circleFillGap = 0.2;
    configCPU.textVertPosition = 0.8;
    configCPU.waveAnimateTime = 1000;
    configCPU.waveHeight = 0.05;
    configCPU.waveAnimate = true;
    configCPU.waveRise = false;
    configCPU.textVertPosition = 0.52;
    configCPU.waveHeightScaling = false;
    configCPU.waveOffset = 0.25;
    configCPU.textSize = 0.75;
    configCPU.waveCount = 3;
    loadLiquidFillGauge('dashboard_cpu', 32.14, configCPU);

    // Memory
    const configMem = liquidFillGaugeDefaultSettings();
    configMem.circleThickness = 0.05;
    configMem.circleFillGap = 0.2;
    configMem.textVertPosition = 0.8;
    configMem.waveAnimateTime = 1000;
    configMem.waveHeight = 0.05;
    configMem.waveAnimate = true;
    configMem.waveRise = false;
    configMem.textVertPosition = 0.52;
    configMem.waveHeightScaling = false;
    configMem.waveOffset = 0.25;
    configMem.textSize = 0.75;
    configMem.waveCount = 3;
    loadLiquidFillGauge('dashboard_mem', 60.44, configMem);

    // disk
    const configDisk = liquidFillGaugeDefaultSettings();
    configDisk.circleThickness = 0.05;
    configDisk.circleFillGap = 0.2;
    configDisk.textVertPosition = 0.8;
    configDisk.waveAnimateTime = 1000;
    configDisk.waveHeight = 0.05;
    configDisk.waveAnimate = true;
    configDisk.waveRise = false;
    configDisk.textVertPosition = 0.52;
    configDisk.waveHeightScaling = false;
    configDisk.waveOffset = 0.25;
    configDisk.textSize = 0.75;
    configDisk.waveCount = 3;
    loadLiquidFillGauge('dashboard_storage', 18.65, configDisk);

    // Network
    const configNet = liquidFillGaugeDefaultSettings();
    configNet.circleThickness = 0.05;
    configNet.circleFillGap = 0.2;
    configNet.textVertPosition = 0.8;
    configNet.waveAnimateTime = 1000;
    configNet.waveHeight = 0.05;
    configNet.waveAnimate = true;
    configNet.waveRise = false;
    configNet.textVertPosition = 0.52;
    configNet.waveHeightScaling = false;
    configNet.waveOffset = 0.25;
    configNet.textSize = 0.75;
    configNet.waveCount = 3;
    loadLiquidFillGauge('dashboard_network', 28.56, configNet);

    // Pod
    const configPod = liquidFillGaugeDefaultSettings();
    configPod.circleThickness = 0.05;
    configPod.circleFillGap = 0.2;
    configPod.textVertPosition = 0.8;
    configPod.waveAnimateTime = 1000;
    configPod.waveHeight = 0.00;
    configPod.waveAnimate = true;
    configPod.waveRise = false;
    configPod.textVertPosition = 0.52;
    configPod.waveHeightScaling = false;
    configPod.waveOffset = 0.25;
    configPod.textSize = 1.25;
    configPod.waveCount = 3;
    configPod.displayPercent = false;
    configPod.minValue = 0;
    configPod.waveColor = 'transparent';
    configPod.waveTextColor = '#045681';
    // configPod.maxValue = 999999;
    loadLiquidFillGauge('dashboard_pod', 120, configPod);

    // Image
    const configImg = liquidFillGaugeDefaultSettings();
    configImg.circleThickness = 0.05;
    configImg.circleFillGap = 0.2;
    configImg.textVertPosition = 0.8;
    configImg.waveAnimateTime = 1000;
    configImg.waveHeight = 0.00;
    configImg.waveAnimate = true;
    configImg.waveRise = false;
    configImg.textVertPosition = 0.52;
    configImg.waveHeightScaling = false;
    configImg.waveOffset = 0.25;
    configImg.textSize = 1.25;
    configImg.waveCount = 3;
    configImg.displayPercent = false;
    configImg.minValue = 0;
    configImg.waveColor = 'transparent';
    configImg.waveTextColor = '#045681';
    // configImg.maxValue = 999999;
    loadLiquidFillGauge('dashboard_image', 213, configImg);
  }
}
