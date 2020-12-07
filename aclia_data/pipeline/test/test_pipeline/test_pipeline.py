import logging
import os
import shutil
import unittest

import pandas as pd
from pipeline import pipeline, utils

logging.basicConfig(level=logging.ERROR)


class PipelineTest(unittest.TestCase):
    def setUp(self):
        self.ppl = pipeline.Pipeline()
        self.data_dir = os.path.join(os.path.dirname(__file__), "data")

    def test_add_data(self):
        data_path = os.path.join(
            self.data_dir, "documents-AR-actes_DPT30_20180109_20180113.tar.gz"
        )

        self.ppl.add_data(data_path, unzip=True)

        self.assertEqual(self.ppl.data.shape, (3, 10))

        shutil.rmtree(utils.remove_extension(data_path))

    def test_add_metadata(self):
        metadata_path = os.path.join(self.data_dir, "DONNEES_PROJET_ACLIA.7z")

        self.ppl.add_metadata(metadata_path, unzip=True)

        self.assertEqual(self.ppl.metadata.shape, (20, 53))

        shutil.rmtree(utils.remove_extension(metadata_path))

    def test_get_full_table(self):
        self.ppl.data = pd.read_csv(os.path.join(self.data_dir, "data.csv"), dtype=object)
        self.ppl.metadata = pd.read_csv(os.path.join(self.data_dir, "metadata.csv"), dtype=object)

        full_table = self.ppl.get_full_table()

        self.assertEqual(full_table.shape, (3, 62))

    def test_save_pipeline(self):
        self.ppl.data = pd.read_csv(os.path.join(self.data_dir, "data.csv"), dtype=object)
        self.ppl.metadata = pd.read_csv(os.path.join(self.data_dir, "metadata.csv"), dtype=object)

        pipeline_file = os.path.join(self.data_dir, "test_pipeline_save")
        self.ppl.save_pipeline(pipeline_file)

        self.assertTrue(os.path.exists(pipeline_file))
        self.assertEqual(os.path.getsize(pipeline_file), 9016)

        os.remove(pipeline_file)

    def test_load_pipeline(self):
        self.ppl.load_pipeline(os.path.join(self.data_dir, "example.pipeline"))

        self.assertEqual(self.ppl.data.shape, (3, 10))
        self.assertEqual(self.ppl.metadata.shape, (20, 53))


if __name__ == "__main__":
    unittest.main()
