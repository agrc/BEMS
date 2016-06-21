#!/usr/bin/env python
# * coding: utf8 *
'''
BemsPallet.py

A module that contains a pallet to update the querable layers behind our UTM basemaps
'''

from forklift.models import Pallet
from os.path import join


class BemsPallet(Pallet):

    def __init__(self):
        super(BemsPallet, self).__init__()

        self.arcgis_services = [('BEMS/Boundaries', 'MapServer')]

        self.destination_workspace = 'C:\\Scheduled\\Staging\\Health.gdb'
        self.copy_data = [self.destination_workspace]

    def build(self, configuration=None):
        self.add_crates(['EMSServiceAreas'], {'source_workspace': join(self.garage, 'SGID10.sde'),
                                              'destination_workspace': self.destination_workspace})
